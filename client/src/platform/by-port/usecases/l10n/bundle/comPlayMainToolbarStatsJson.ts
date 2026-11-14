import L10nBundleAdapter from '@/client/src/platform/by-port/io/l10n/adapters/bundle.ts';

await L10nBundleAdapter.loadNamespace('com_play_main_toolbar_stats');

export default function comPlayMainToolbarStatsJson(key: string, props?: Record<string, number | string>): string {
  return L10nBundleAdapter.t(`com_play_main_toolbar_stats.${key}`, props);
}
