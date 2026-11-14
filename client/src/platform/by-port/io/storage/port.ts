export interface StoragePort {
  delete(key: string): Promise<void>;
  load(key: string): Promise<unknown>;
  save(key: string, data: unknown): Promise<void>;
}
