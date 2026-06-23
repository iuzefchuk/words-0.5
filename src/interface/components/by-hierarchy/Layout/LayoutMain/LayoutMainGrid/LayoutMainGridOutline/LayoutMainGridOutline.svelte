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
    style:--outline-grid-step="calc((100% + var(--grid-gap)) / var(--grid-items-per-axis))"
    style:top={`calc(var(--outline-grid-step) * ${group.row})`}
    style:left={`calc(var(--outline-grid-step) * ${group.col})`}
    style:width={`calc(var(--outline-grid-step) * ${group.colSpan} - var(--grid-gap) - 1px)`}
    style:height={`calc(var(--outline-grid-step) * ${group.rowSpan} - var(--grid-gap) - 1px)`}
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
    outline: var(--tile-outline);
    border-radius: var(--grid-item-radius);
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-half);
    transition-property: top, left, width, height, outline;
  }
</style>
