import { PlayHostType } from '@/client/domain/enums/PlayHostType.ts';
import I18nLibrary from '@/client/libraries/I18nLibrary.ts';

await I18nLibrary.loadNamespace('map_play_host_type');

export default function mapPlayHostTypeJson(hostType: PlayHostType): string {
  return I18nLibrary.t(
    (
      {
        [PlayHostType.Client]: 'map_play_host_type.client',
        [PlayHostType.Server]: 'map_play_host_type.server',
      } as const
    )[hostType],
  );
}
