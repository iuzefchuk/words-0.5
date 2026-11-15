import HttpProtocol from '@/client/src/platform/by-protocol/io/http.ts';
import type { PlayState } from '@/client/src/domain/play.ts';

const PATH = '/api/match/resign';

export default {
  post(): Promise<PlayState> {
    return HttpProtocol.post<PlayState>(PATH);
  },
};
