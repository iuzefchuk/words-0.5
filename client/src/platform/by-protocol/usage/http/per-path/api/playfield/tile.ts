import HttpProtocol from '@/client/src/platform/by-protocol/io/http.ts';
import type { PlayBlockId, PlaySlotId, PlayState } from '@/client/src/domain/play.ts';

const PATH = '/api/playfield/tile';

export default {
  put(link: { cell: PlaySlotId; tile: PlayBlockId }): Promise<PlayState> {
    return HttpProtocol.put<PlayState>(PATH, link);
  },
};
