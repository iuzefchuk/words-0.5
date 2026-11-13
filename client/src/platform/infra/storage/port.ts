export interface StoragePort<Key extends string> {
  delete(key: Key): Promise<void>;
  load(key: Key): Promise<unknown>;
  save(key: Key, data: unknown): Promise<void>;
}
