import { PlayPlayer } from '@/client/domain/enums.ts';
import I18nLibrary from '@/client/libraries/I18nLibrary.ts';

await I18nLibrary.loadNamespace('map_play_player');

export default function mapPlayPlayerJson(player: PlayPlayer): string {
  return I18nLibrary.t(
    (
      {
        [PlayPlayer.Opponent]: 'map_play_player.opponent',
        [PlayPlayer.User]: 'map_play_player.user',
      } as const
    )[player],
  );
}
