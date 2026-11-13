<script lang="ts">
  import animateNumber from '@/client/src/fw/headless/actions/animateNumber.ts';
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';
  import I18nJsonAdapter from '@/client/src/platform/infra/i18n/adapters/json.ts';

  const runtime = getPlayRuntimeContext();

  await I18nJsonAdapter.loadNamespace('com_play_main_toolbar_stats');
</script>

<p role="note" class="stats">
  <span use:animateNumber={{ number: runtime.blocksRemaining }} class="stats__number"></span>
  <span>{I18nJsonAdapter.t('com_play_main_toolbar_stats.unassigned_count')}</span>
</p>

<style>
  .stats {
    display: flex;
    gap: var(--space-2xs);
    margin: 0;
    font-size: var(--font-size-secondary);
    font-weight: var(--font-weight-secondary);
    color: var(--color-secondary);
    user-select: none;
    background: var(--bg-secondary);
  }
</style>
