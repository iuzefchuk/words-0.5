export interface StoragePort {
  delete(key: string, version: number): Promise<void>;
  load(key: string, version: number): Promise<unknown>;
  save(key: string, version: number, data: unknown): Promise<void>;
}
