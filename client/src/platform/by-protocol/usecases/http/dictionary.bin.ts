import HttpProtocol from '@/client/src/platform/by-protocol/io/http.ts';
import dictionaryUrl from '@/engine/src/assets/dictionary.bin?url';

export default {
  get(): Promise<ArrayBuffer> {
    return HttpProtocol.get<ArrayBuffer>(dictionaryUrl);
  },
};
