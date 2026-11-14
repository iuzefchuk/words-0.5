import L10nBundleAdapter from '@/client/src/platform/by-port/io/l10n/adapters/bundle.ts';

await L10nBundleAdapter.loadNamespace('com_index_error');

export default function comIndexErrorJson(key: string, props?: Record<string, number | string>): string {
  return L10nBundleAdapter.t(`com_index_error.${key}`, props);
}
