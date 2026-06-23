<script lang="ts">
  import { fade } from 'svelte/transition';
  import LayoutMainGridOutlineTooltip from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainGrid/LayoutMainGridOutline/LayoutMainGridOutlineTooltip.svelte';
  import Outline from '@/interface/runes/outline.svelte.ts';

  const outline = new Outline();
</script>

{#each outline.bounds as group, idx (idx)}
  <div
    class="outline"
    role="presentation"
    style:--step="calc((100% + var(--gap-grid)) / var(--grid-items-per-axis))"
    style:top={`calc(var(--step) * ${group.row})`}
    style:left={`calc(var(--step) * ${group.col})`}
    style:width={`calc(var(--step) * ${group.colSpan} - var(--gap-grid) - 1px)`}
    style:height={`calc(var(--step) * ${group.rowSpan} - var(--gap-grid) - 1px)`}
  >
    {#if outline.isAnchorAt(idx)}
      <span transition:fade={{ duration: 250 }}>
        <LayoutMainGridOutlineTooltip isFlipped={outline.isOnRightmostColumnAt(idx)} />
      </span>
    {/if}
  </div>
{/each}

<style>
  .outline {
    position: absolute;
    z-index: var(--z-index-level-1);
    pointer-events: none;
    outline: var(--outline);
    border-radius: var(--radius-grid);
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-short);
    transition-property: top, left, width, height, outline;
  }
</style>
