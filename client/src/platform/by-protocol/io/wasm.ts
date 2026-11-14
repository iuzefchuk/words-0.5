type Invoke = () => number;

type WasmExports = {
  alloc(length: number): number;
  dealloc(pointer: number): void;
  memory: WebAssembly.Memory;
  panic_message(): number;
};

const DECODER = new TextDecoder();

const ENCODER = new TextEncoder();

const HEADER_LENGTH = 5;

const STATUS_OK = 0;

let wasmExports: undefined | WasmExports;

function callNumber(invoke: Invoke): number {
  try {
    return invoke();
  } catch (error) {
    throw new Error(readPanicMessage(), { cause: error });
  }
}

function callText(invoke: Invoke): string {
  return readResponse(callNumber(invoke));
}

function instantiatedExports(): WasmExports {
  if (wasmExports === undefined) throw new ReferenceError('expected instantiated module, got undefined');
  return wasmExports;
}

function readPanicMessage(): string {
  try {
    return readResponse(instantiatedExports().panic_message());
  } catch (error) {
    console.warn('WasmProtocol:', error);
    return 'module panicked';
  }
}

function readResponse(pointer: number): string {
  const exports = instantiatedExports();
  const { buffer } = exports.memory;
  const header = new DataView(buffer, pointer, HEADER_LENGTH);
  const status = header.getUint8(0);
  const length = header.getUint32(1, true);
  const text = DECODER.decode(new Uint8Array(buffer, pointer + HEADER_LENGTH, length));
  exports.dealloc(pointer);
  if (status !== STATUS_OK) throw new Error(text);
  return text;
}

export default {
  allocate(value: string | Uint8Array): number {
    const bytes = typeof value === 'string' ? ENCODER.encode(value) : value;
    if (bytes.length === 0) return 0;
    const exports = instantiatedExports();
    const pointer = exports.alloc(bytes.length);
    new Uint8Array(exports.memory.buffer).set(bytes, pointer);
    return pointer;
  },
  callJson(invoke: Invoke): unknown {
    return JSON.parse(callText(invoke));
  },
  callNumber,
  callText,
  async instantiate<Exports extends WebAssembly.Exports>(wasm: ArrayBuffer): Promise<Exports> {
    const { instance } = await WebAssembly.instantiate(wasm, {});
    const exports = instance.exports as Exports & WasmExports;
    wasmExports = exports;
    return exports;
  },
};
