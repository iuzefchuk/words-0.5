import type { StoragePort } from '@/client/src/platform/infra/storage/port.ts';

export enum DbName {
  PlayRuntimeEvents = 'play_runtime_events',
}

export default class StorageDbAdapter {
  private static readonly STORE_NAME = 'snapshots';

  private static readonly VERSION = 5;

  static async delete(dbName: DbName): Promise<void> {
    let db: IDBDatabase | undefined;
    try {
      db = await this.openDatabase(dbName);
      const transaction = db.transaction(this.STORE_NAME, 'readwrite', { durability: 'relaxed' });
      transaction.objectStore(this.STORE_NAME).clear();
      transaction.commit();
      await this.awaitTransaction(transaction);
    } catch (error) {
      console.warn('StorageDbAdapter:', error);
    } finally {
      db?.close();
    }
  }

  static async load(dbName: DbName): Promise<unknown> {
    let db: IDBDatabase | undefined;
    try {
      db = await this.openDatabase(dbName);
      const store = db.transaction(this.STORE_NAME, 'readonly').objectStore(this.STORE_NAME);
      const data = await this.awaitRequest<unknown>(store.get(dbName));
      return data ?? null;
    } catch (error) {
      console.warn('StorageDbAdapter:', error);
      return null;
    } finally {
      db?.close();
    }
  }

  static async save(dbName: DbName, data: unknown): Promise<void> {
    let db: IDBDatabase | undefined;
    try {
      db = await this.openDatabase(dbName);
      const transaction = db.transaction(this.STORE_NAME, 'readwrite', { durability: 'relaxed' });
      const store = transaction.objectStore(this.STORE_NAME);
      store.clear();
      store.put(data, dbName);
      transaction.commit();
      await this.awaitTransaction(transaction);
    } catch (error) {
      console.warn('StorageDbAdapter:', error);
    } finally {
      db?.close();
    }
  }

  private static awaitRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error('Database request failed'));
      };
    });
  }

  private static awaitTransaction(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onabort = () => {
        reject(transaction.error ?? new Error('Database transaction aborted'));
      };
    });
  }

  private static openDatabase(dbName: DbName): Promise<IDBDatabase> {
    const request = indexedDB.open(dbName, this.VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of Array.from(db.objectStoreNames)) db.deleteObjectStore(name);
      db.createObjectStore(this.STORE_NAME);
    };
    return this.awaitRequest(request);
  }
}

StorageDbAdapter satisfies StoragePort<DbName>;
