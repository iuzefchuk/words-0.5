import type { StoragePort } from '@/client/src/platform/by-port/io/storage/port.ts';

function remove(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('StorageLocalAdapter:', error);
  }
  return Promise.resolve();
}

export default {
  delete: remove,
  load(key: string): Promise<unknown> {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return Promise.resolve(null);
      const data: unknown = JSON.parse(raw);
      return Promise.resolve(data);
    } catch (error) {
      console.warn('StorageLocalAdapter:', error);
      void remove(key);
      return Promise.resolve(null);
    }
  },
  save(key: string, data: unknown): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('StorageLocalAdapter:', error);
    }
    return Promise.resolve();
  },
} satisfies StoragePort;
