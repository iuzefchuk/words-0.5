import HttpProtocol from '@/client/src/platform/by-protocol/io/http.ts';
import type { PlaySettings, PlayState } from '@/client/src/domain/play.ts';

const PATH = '/api/match/settings';

export default {
  patch(settings: Partial<PlaySettings>): Promise<PlayState> {
    return HttpProtocol.patch<PlayState>(PATH, settings);
  },
};
