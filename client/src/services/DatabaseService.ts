export enum DatabaseName {
  PlayRuntimeEvents = 'play_runtime_events',
}

export default class DatabaseService {
  private static readonly CONNECTIONS = new Map<DatabaseName, Promise<IDBDatabase>>();

  private static readonly STORE_NAME = 'snapshots';

  private static readonly VERSION = 5;

  static async load(dbName: DatabaseName, version: number): Promise<unknown> {
    try {
      const db = await this.connect(dbName);
      const store = db.transaction(this.STORE_NAME, 'readonly').objectStore(this.STORE_NAME);
      const data = await this.awaitRequest<unknown>(store.get(version));
      return data ?? null;
    } catch (error) {
      console.warn('DatabaseService:', error);
      return null;
    }
  }

  static async save(dbName: DatabaseName, version: number, data: unknown): Promise<void> {
    try {
      const db = await this.connect(dbName);
      const transaction = db.transaction(this.STORE_NAME, 'readwrite', { durability: 'relaxed' });
      const store = transaction.objectStore(this.STORE_NAME);
      store.clear();
      store.put(data, version);
      transaction.commit();
      await this.awaitTransaction(transaction);
    } catch (error) {
      console.warn('DatabaseService:', error);
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

  private static connect(dbName: DatabaseName): Promise<IDBDatabase> {
    let connection = this.CONNECTIONS.get(dbName);
    if (connection === undefined) {
      connection = this.openDatabase(dbName);
      connection.catch(() => {
        this.CONNECTIONS.delete(dbName);
      });
      this.CONNECTIONS.set(dbName, connection);
    }
    return connection;
  }

  private static async openDatabase(dbName: DatabaseName): Promise<IDBDatabase> {
    const request = indexedDB.open(dbName, this.VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of Array.from(db.objectStoreNames)) db.deleteObjectStore(name);
      db.createObjectStore(this.STORE_NAME);
    };
    const db = await this.awaitRequest(request);
    db.onversionchange = () => {
      db.close();
      this.CONNECTIONS.delete(dbName);
    };
    db.onclose = () => {
      this.CONNECTIONS.delete(dbName);
    };
    return db;
  }
}
