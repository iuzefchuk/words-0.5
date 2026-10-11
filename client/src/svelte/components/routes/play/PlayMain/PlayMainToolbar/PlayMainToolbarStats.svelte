<script lang="ts">
  import I18nLibrary from '@/client/libraries/I18nLibrary.ts';
  import animateNumber from '@/client/svelte/actions/animateNumber.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';

  const runtime = getPlayRuntimeContext();

  await I18nLibrary.loadNamespace('com_play_main_toolbar_stats');
</script>

<p role="note" class="stats">
  <span use:animateNumber={{ number: runtime.blocksRemaining }} class="stats__number"></span>
  <span>{I18nLibrary.t('com_play_main_toolbar_stats.unassigned_count')}</span>
</p>

<style>
  .stats {
    display: flex;
    gap: var(--space-2xs);
    font-size: var(--font-size-secondary);
    font-weight: var(--font-weight-secondary);
    color: var(--color-secondary);
    user-select: none;
    background: var(--bg-secondary);
  }
</style>
