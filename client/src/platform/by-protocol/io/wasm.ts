type Invoke = () => number;

type ResponseEvaluation = { error: string } | { payload: string };

type WasmExports = {
  alloc(length: number): number;
  dealloc(pointer: number): void;
  memory: WebAssembly.Memory;
  panic_message(): number;
};

class WasmExchange {
  private static readonly DECODER = new TextDecoder();

  private static readonly ENCODER = new TextEncoder();

  private static exports: undefined | WasmExports;

  private static readonly HEADER_LENGTH = 5;

  private static readonly STATUS_OK = 0;

  static allocate(value: string | Uint8Array): number {
    const bytes = typeof value === 'string' ? this.ENCODER.encode(value) : value;
    if (bytes.length === 0) return 0;
    const exports = this.getExports();
    const pointer = exports.alloc(bytes.length);
    new Uint8Array(exports.memory.buffer).set(bytes, pointer);
    return pointer;
  }

  static execute(invoke: Invoke): string {
    const evaluation = this.evaluateResponse(this.invoke(invoke));
    if ('error' in evaluation) throw new Error(evaluation.error);
    return evaluation.payload;
  }

  static async instantiate<Exports extends WebAssembly.Exports>(wasm: ArrayBuffer): Promise<Exports> {
    const { instance } = await WebAssembly.instantiate(wasm, {});
    const exports = instance.exports as Exports & WasmExports;
    this.exports = exports;
    return exports;
  }

  static invoke(invoke: Invoke): number {
    try {
      return invoke();
    } catch (error) {
      throw new Error(this.readPanicMessage(), { cause: error });
    }
  }

  private static evaluateResponse(pointer: number): ResponseEvaluation {
    const exports = this.getExports();
    const { buffer } = exports.memory;
    const header = new DataView(buffer, pointer, this.HEADER_LENGTH);
    const status = header.getUint8(0);
    const length = header.getUint32(1, true);
    const text = this.DECODER.decode(new Uint8Array(buffer, pointer + this.HEADER_LENGTH, length));
    exports.dealloc(pointer);
    return status === this.STATUS_OK ? { payload: text } : { error: text };
  }

  private static getExports(): WasmExports {
    if (this.exports === undefined) throw new ReferenceError('expected instantiated module, got undefined');
    return this.exports;
  }

  private static readPanicMessage(): string {
    try {
      const evaluation = this.evaluateResponse(this.getExports().panic_message());
      return 'error' in evaluation ? evaluation.error : evaluation.payload;
    } catch (error) {
      console.warn(error);
      return 'module panicked';
    }
  }
}

export default {
  allocate(value: string | Uint8Array): number {
    return WasmExchange.allocate(value);
  },
  callJson(invoke: Invoke): unknown {
    return JSON.parse(WasmExchange.execute(invoke));
  },
  callNumber(invoke: Invoke): number {
    return WasmExchange.invoke(invoke);
  },
  callText(invoke: Invoke): string {
    return WasmExchange.execute(invoke);
  },
  instantiate<Exports extends WebAssembly.Exports>(wasm: ArrayBuffer): Promise<Exports> {
    return WasmExchange.instantiate(wasm);
  },
};
