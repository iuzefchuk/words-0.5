import type { StoragePort } from '@/client/src/platform/by-port/io/storage/port.ts';

const STORE_NAME = 'snapshots';

const VERSION = 5;

function awaitRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('Database request failed'));
    };
  });
}

function awaitTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error('Database transaction aborted'));
    };
  });
}

function openDatabase(key: string): Promise<IDBDatabase> {
  const request = indexedDB.open(key, VERSION);
  request.onupgradeneeded = () => {
    const db = request.result;
    for (const name of Array.from(db.objectStoreNames)) db.deleteObjectStore(name);
    db.createObjectStore(STORE_NAME);
  };
  return awaitRequest(request);
}

export default {
  async delete(key: string): Promise<void> {
    let db: IDBDatabase | undefined;
    try {
      db = await openDatabase(key);
      const transaction = db.transaction(STORE_NAME, 'readwrite', { durability: 'relaxed' });
      transaction.objectStore(STORE_NAME).clear();
      transaction.commit();
      await awaitTransaction(transaction);
    } catch (error) {
      console.warn('StorageDbAdapter:', error);
    } finally {
      db?.close();
    }
  },
  async load(key: string): Promise<unknown> {
    let db: IDBDatabase | undefined;
    try {
      db = await openDatabase(key);
      const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
      const data = await awaitRequest<unknown>(store.get(key));
      return data ?? null;
    } catch (error) {
      console.warn('StorageDbAdapter:', error);
      return null;
    } finally {
      db?.close();
    }
  },
  async save(key: string, data: unknown): Promise<void> {
    let db: IDBDatabase | undefined;
    try {
      db = await openDatabase(key);
      const transaction = db.transaction(STORE_NAME, 'readwrite', { durability: 'relaxed' });
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      store.put(data, key);
      transaction.commit();
      await awaitTransaction(transaction);
    } catch (error) {
      console.warn('StorageDbAdapter:', error);
    } finally {
      db?.close();
    }
  },
} satisfies StoragePort;
