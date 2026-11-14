import HttpProtocol from '@/client/src/platform/by-protocol/io/http.ts';
import engineUrl from '@/engine/target/wasm32-unknown-unknown/release/engine.wasm?url';

export default {
  get(): Promise<ArrayBuffer> {
    return HttpProtocol.get<ArrayBuffer>(engineUrl);
  },
};
