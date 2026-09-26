export enum StorageType {
  Local = 'local',
  Session = 'session',
}

export default class StorageService {
  static delete(type: StorageType, key: string): void {
    try {
      this.getStorage(type).removeItem(key);
    } catch (error) {
      console.warn('StorageService:', error);
    }
  }

  static load(type: StorageType, key: string): unknown {
    try {
      const raw = this.getStorage(type).getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('StorageService:', error);
      this.delete(type, key);
      return null;
    }
  }

  static save(type: StorageType, key: string, data: unknown): void {
    try {
      this.getStorage(type).setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('StorageService:', error);
    }
  }

  private static getStorage(type: StorageType): Storage {
    switch (type) {
      case StorageType.Local:
        return localStorage;
      case StorageType.Session:
        return sessionStorage;
    }
  }
}
