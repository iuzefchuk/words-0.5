import StorageDbAdapter from '@/client/src/platform/by-port/io/storage/adapters/db.ts';

const KEY = 'play_runtime_events';

export default {
  load(): Promise<unknown> {
    return StorageDbAdapter.load(KEY);
  },
  save(data: unknown): Promise<void> {
    return StorageDbAdapter.save(KEY, data);
  },
};
