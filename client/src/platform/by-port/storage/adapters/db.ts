import type { StoragePort } from '@/client/src/platform/by-port/storage/port.ts';

function settle(target: IDBOpenDBRequest | IDBTransaction, done: string, failed: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    target.addEventListener(done, resolve);
    target.addEventListener(failed, () => {
      reject(target.error ?? new Error(`Database ${failed}`));
    });
  });
}

async function transact<T>(
  key: string,
  version: number,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<null | T> {
  let db: IDBDatabase | undefined;
  try {
    const opening = indexedDB.open(key, version);
    opening.onupgradeneeded = () => {
      for (const name of opening.result.objectStoreNames) opening.result.deleteObjectStore(name);
      opening.result.createObjectStore(key);
    };
    await settle(opening, 'success', 'error');
    db = opening.result;
    const transaction = db.transaction(key, mode, { durability: 'relaxed' });
    const request = callback(transaction.objectStore(key));
    await settle(transaction, 'complete', 'abort');
    return request.result ?? null;
  } catch (error) {
    console.warn(error);
    return null;
  } finally {
    db?.close();
  }
}

export default {
  async delete(key: string, version: number): Promise<void> {
    await transact(key, version, 'readwrite', store => store.clear());
  },
  load(key: string, version: number): Promise<unknown> {
    return transact<unknown>(key, version, 'readonly', store => store.get(key));
  },
  async save(key: string, version: number, data: unknown): Promise<void> {
    await transact(key, version, 'readwrite', store => store.put(data, key));
  },
} satisfies StoragePort;
