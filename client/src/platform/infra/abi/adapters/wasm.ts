import type { AbiPort } from '@/client/src/platform/infra/abi/port.ts';

type AbiExports = {
  alloc(length: number): number;
  dealloc(pointer: number): void;
  memory: WebAssembly.Memory;
  panic_message(): number;
};

type Invoke = () => number;

export default class AbiWasmAdapter {
  private static readonly DECODER = new TextDecoder();

  private static readonly ENCODER = new TextEncoder();

  private static exports: AbiExports | undefined;

  private static readonly HEADER_LENGTH = 5;

  private static readonly STATUS_OK = 0;

  static allocate(value: string | Uint8Array): number {
    const bytes = typeof value === 'string' ? AbiWasmAdapter.ENCODER.encode(value) : value;
    if (bytes.length === 0) return 0;
    const exports = AbiWasmAdapter.instantiatedExports();
    const pointer = exports.alloc(bytes.length);
    new Uint8Array(exports.memory.buffer).set(bytes, pointer);
    return pointer;
  }

  static callJson(invoke: Invoke): unknown {
    return JSON.parse(AbiWasmAdapter.callText(invoke));
  }

  static callNumber(invoke: Invoke): number {
    try {
      return invoke();
    } catch (error) {
      throw new Error(AbiWasmAdapter.readPanicMessage(), { cause: error });
    }
  }

  static callText(invoke: Invoke): string {
    return AbiWasmAdapter.readResponse(AbiWasmAdapter.callNumber(invoke));
  }

  static async instantiate<Exports extends WebAssembly.Exports>(wasm: ArrayBuffer): Promise<Exports> {
    const { instance } = await WebAssembly.instantiate(wasm, {});
    const exports = instance.exports as AbiExports & Exports;
    AbiWasmAdapter.exports = exports;
    return exports;
  }

  private static instantiatedExports(): AbiExports {
    if (AbiWasmAdapter.exports === undefined) throw new ReferenceError('expected instantiated module, got undefined');
    return AbiWasmAdapter.exports;
  }

  private static readPanicMessage(): string {
    try {
      return AbiWasmAdapter.readResponse(AbiWasmAdapter.instantiatedExports().panic_message());
    } catch {
      return 'module panicked';
    }
  }

  private static readResponse(pointer: number): string {
    const exports = AbiWasmAdapter.instantiatedExports();
    const { buffer } = exports.memory;
    const header = new DataView(buffer, pointer, AbiWasmAdapter.HEADER_LENGTH);
    const status = header.getUint8(0);
    const length = header.getUint32(1, true);
    const text = AbiWasmAdapter.DECODER.decode(new Uint8Array(buffer, pointer + AbiWasmAdapter.HEADER_LENGTH, length));
    exports.dealloc(pointer);
    if (status !== AbiWasmAdapter.STATUS_OK) throw new Error(text);
    return text;
  }
}

AbiWasmAdapter satisfies AbiPort;
