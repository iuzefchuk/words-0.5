import type { StoragePort } from '@/client/src/platform/by-port/storage/port.ts';

function transact<T>(key: string, version: number, callback: (name: string) => T): Promise<null | T> {
  try {
    return Promise.resolve(callback(`${key}_v${String(version)}`));
  } catch (error) {
    console.warn(error);
    return Promise.resolve(null);
  }
}

export default {
  async delete(key: string, version: number): Promise<void> {
    await transact(key, version, name => {
      localStorage.removeItem(name);
    });
  },
  load(key: string, version: number): Promise<unknown> {
    return transact<unknown>(key, version, name => JSON.parse(localStorage.getItem(name) ?? 'null'));
  },
  async save(key: string, version: number, data: unknown): Promise<void> {
    await transact(key, version, name => {
      localStorage.setItem(name, JSON.stringify(data));
    });
  },
} satisfies StoragePort;
