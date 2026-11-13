import type { StoragePort } from '@/client/src/platform/infra/storage/port.ts';

export enum LocalKey {
  PlayRuntimeConfig = 'play_runtime_config',
}

export default class StorageLocalAdapter {
  static delete(key: LocalKey): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('StorageLocalAdapter:', error);
    }
    return Promise.resolve();
  }

  static load(key: LocalKey): Promise<unknown> {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return Promise.resolve(null);
      const data: unknown = JSON.parse(raw);
      return Promise.resolve(data);
    } catch (error) {
      console.warn('StorageLocalAdapter:', error);
      void this.delete(key);
      return Promise.resolve(null);
    }
  }

  static save(key: LocalKey, data: unknown): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('StorageLocalAdapter:', error);
    }
    return Promise.resolve();
  }
}

StorageLocalAdapter satisfies StoragePort<LocalKey>;
