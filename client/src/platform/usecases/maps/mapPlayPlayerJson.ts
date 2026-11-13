import { PlayPlayer } from '@/client/src/domain/play.ts';
import I18nJsonAdapter from '@/client/src/platform/infra/i18n/adapters/json.ts';

await I18nJsonAdapter.loadNamespace('map_play_player');

export default function mapPlayPlayerJson(player: PlayPlayer): string {
  return I18nJsonAdapter.t(
    (
      {
        [PlayPlayer.Opponent]: 'map_play_player.opponent',
        [PlayPlayer.User]: 'map_play_player.user',
      } as const
    )[player],
  );
}
