export enum LocalStorageKey {
  PlayRuntimeConfig = 'play_runtime_config',
}

export enum StorageType {
  Local = 'local',
  Session = 'session',
}

export default class StorageService {
  static delete(type: StorageType, key: LocalStorageKey): void {
    try {
      this.getStorage(type).removeItem(key);
    } catch (error) {
      console.warn('StorageService:', error);
    }
  }

  static load(type: StorageType, key: LocalStorageKey): unknown {
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

  static save(type: StorageType, key: LocalStorageKey, data: unknown): void {
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
