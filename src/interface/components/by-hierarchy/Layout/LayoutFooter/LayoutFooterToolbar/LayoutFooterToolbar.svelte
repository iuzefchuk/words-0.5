<script lang="ts">
  import AppTile from '@/interface/components/app/AppTile.svelte';
  import LayoutFooterToolbarStats from '@/interface/components/by-hierarchy/Layout/LayoutFooter/LayoutFooterToolbar/LayoutFooterToolbarStats.svelte';
  import { Accent } from '@/interface/enums.ts';
  import { handlePressToolbarCell, handlePressToolbarTile } from '@/interface/handlers/toolbar.ts';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import userStore from '@/interface/runes/user.svelte.ts';
  import type { DomainInventoryTile } from '@/app/types/index.ts';

  const paddedTiles = $derived(
    Array.from({ length: mainStore.tilesPerPlayer }, (_, idx): DomainInventoryTile | null => userStore.tiles[idx] ?? null),
  );

  function activate(idx: number, tile: DomainInventoryTile | null): void {
    if (tile === null) return;
    if (mainStore.isTilePlaced(tile)) {
      handlePressToolbarCell(idx);
      return;
    }
    handlePressToolbarTile(tile);
  }
</script>

<div class="toolbar" role="toolbar" aria-label="Tile rack" tabindex="-1">
  <ul class="toolbar__grid app__create-grid--for-footer-toolbar">
    {#each paddedTiles as tile, idx (idx)}
      <li class="toolbar__cell">
        <button
          type="button"
          class="toolbar__button"
          disabled={mainStore.allActionsAreDisabled || tile === null}
          onclick={event => {
            event.stopPropagation();
            activate(idx, tile);
          }}
        >
          {#if tile !== null && userStore.isTileInToolbar(tile) && !mainStore.isTilePlaced(tile)}
            <AppTile
              letter={mainStore.getTileLetter(tile)}
              accent={userStore.isTileSelected(tile) ? Accent.Primary : Accent.Tertiary}
              points={mainStore.getLetterPoints(mainStore.getTileLetter(tile))}
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
    padding: calc(var(--layout-padding) * 2) var(--layout-padding) 0;

    @media screen and (width <= 34rem) {
      grid-column: 1;
    }
  }

  .toolbar__grid {
    width: 100%;
  }

  .toolbar__cell {
    background: var(--toolbar-cell-bg);
    border-radius: calc(var(--grid-item-radius) * 2);
    box-shadow: var(--toolbar-cell-shadow);
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
