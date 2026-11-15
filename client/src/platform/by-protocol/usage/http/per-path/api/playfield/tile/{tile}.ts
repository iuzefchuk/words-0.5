import HttpProtocol from '@/client/src/platform/by-protocol/io/http.ts';
import type { PlayBlockId, PlayState } from '@/client/src/domain/play.ts';

const PATH = '/api/playfield/tile';

export default {
  delete(tile: PlayBlockId): Promise<PlayState> {
    return HttpProtocol.delete<PlayState>(`${PATH}/${encodeURIComponent(tile)}`);
  },
};
