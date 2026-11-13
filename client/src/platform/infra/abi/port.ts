export interface AbiPort {
  allocate(value: string | Uint8Array): Pointer;
  callJson(invoke: () => Pointer): unknown;
  callNumber(invoke: () => number): number;
  callText(invoke: () => Pointer): string;
  instantiate<Exports extends WebAssembly.Exports>(wasm: ArrayBuffer): Promise<Exports>;
}

type Pointer = number;
