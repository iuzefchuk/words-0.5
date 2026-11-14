import { PlayPlayer } from '@/client/src/domain/play.ts';
import L10nBundleAdapter from '@/client/src/platform/by-port/io/l10n/adapters/bundle.ts';

await L10nBundleAdapter.loadNamespace('map_play_player');

export default function mapPlayPlayerJson(player: PlayPlayer): string {
  return L10nBundleAdapter.t(
    (
      {
        [PlayPlayer.Opponent]: 'map_play_player.opponent',
        [PlayPlayer.User]: 'map_play_player.user',
      } as const
    )[player],
  );
}
