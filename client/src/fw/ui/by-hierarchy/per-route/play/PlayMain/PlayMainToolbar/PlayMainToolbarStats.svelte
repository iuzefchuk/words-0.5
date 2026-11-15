<script module lang="ts">
  import L10nGlobAdapter from '@/client/src/platform/by-port/l10n/adapters/glob.ts';

  function comPlayMainToolbarStats(key: string, props?: Record<string, number | string>): string {
    return L10nGlobAdapter.t(`com_play_main_toolbar_stats.${key}`, props);
  }
</script>

<script lang="ts">
  import animateNumber from '@/client/src/fw/headless/actions/animateNumber.ts';
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';

  const runtime = getPlayRuntimeContext();
</script>

<p role="note" class="stats">
  <span use:animateNumber={{ number: runtime.blocksRemaining }} class="stats__number"></span>
  <span>{comPlayMainToolbarStats('unassigned_count')}</span>
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
