import { PlayHostType } from '@/client/src/domain/play.ts';
import I18nJsonAdapter from '@/client/src/platform/infra/i18n/adapters/json.ts';

await I18nJsonAdapter.loadNamespace('map_play_host_type');

export default function mapPlayHostTypeJson(hostType: PlayHostType): string {
  return I18nJsonAdapter.t(
    (
      {
        [PlayHostType.Client]: 'map_play_host_type.client',
        [PlayHostType.Server]: 'map_play_host_type.server',
      } as const
    )[hostType],
  );
}
