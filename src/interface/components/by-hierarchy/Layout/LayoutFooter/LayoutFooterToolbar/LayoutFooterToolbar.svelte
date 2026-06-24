<script lang="ts">
  import AppTile from '@/interface/components/app/AppTile.svelte';
  import LayoutFooterToolbarStats from '@/interface/components/by-hierarchy/Layout/LayoutFooter/LayoutFooterToolbar/LayoutFooterToolbarStats.svelte';
  import { Accent, TransitionDuration } from '@/interface/enums.ts';
  import { handlePressToolbarCell, handlePressToolbarTile } from '@/interface/handlers/toolbar.ts';
  import main from '@/interface/runes/main.svelte.ts';
  import user from '@/interface/runes/user.svelte.ts';
  import type { DomainInventoryTile } from '@/app/types/index.ts';
  import { fly } from 'svelte/transition';

  const paddedTiles = $derived(
    Array.from({ length: main.tilesPerPlayer }, (_, idx): DomainInventoryTile | null => user.tiles[idx] ?? null),
  );

  function activate(idx: number, tile: DomainInventoryTile | null): void {
    if (tile === null) return;
    if (main.isTilePlaced(tile)) {
      handlePressToolbarCell(idx);
      return;
    }
    handlePressToolbarTile(tile);
  }
</script>

<div
  transition:fly|global={{ duration: TransitionDuration.Normal, y: '1rem' }}
  class="toolbar"
  role="toolbar"
  aria-label="Tile rack"
  tabindex="-1"
>
  <ul class="toolbar__grid app__grid">
    {#each paddedTiles as tile, idx (idx)}
      <li class="toolbar__cell">
        <button
          type="button"
          class="toolbar__button"
          disabled={main.allActionsAreDisabled || tile === null}
          onclick={event => {
            event.stopPropagation();
            activate(idx, tile);
          }}
        >
          {#if tile !== null && user.isTileInToolbar(tile) && !main.isTilePlaced(tile)}
            <AppTile
              letter={main.getTileLetter(tile)}
              accent={user.isTileSelected(tile) ? Accent.Primary : Accent.Tertiary}
              points={main.getLetterPoints(main.getTileLetter(tile))}
            />
          {/if}
        </button>
      </li>
    {/each}
    <li role="none">
      <LayoutFooterToolbarStats />
    </li>
  </ul>
</div>

<style>
  .toolbar {
    display: flex;
    flex-direction: column;
    grid-column: 2;
    place-self: flex-start center;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    max-width: 34rem;
    padding: calc(var(--padding-primary) * 2) var(--padding-primary) 0;

    @media screen and (width <= 34rem) {
      grid-column: 1;
    }
  }

  .toolbar__grid {
    width: 100%;
    grid-template-rows: repeat(1, auto);
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: calc(var(--gap-grid) * 2);
  }

  .toolbar__cell {
    background: light-dark(var(--color-level-4), var(--color-level-8));
    border-radius: calc(var(--radius-grid) * 2);
    box-shadow: var(--shadow-level-0);
  }

  .toolbar__button {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
    border-radius: inherit;

    &:disabled {
      cursor: not-allowed;
    }
  }
</style>
