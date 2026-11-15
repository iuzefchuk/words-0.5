import HttpProtocol from '@/client/src/platform/by-protocol/io/http.ts';
import type { PlayGeometry } from '@/client/src/domain/play.ts';

const PATH = '/api/playfield/geometry';

export default {
  get(): Promise<PlayGeometry> {
    return HttpProtocol.get<PlayGeometry>(PATH);
  },
};
