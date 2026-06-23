import mainStore from '@/interface/runes/main.svelte.ts';
import type { DomainInventoryTile } from '@/app/types/index.ts';

// UI-only tile-rack state. `tiles` is a $state array (deep-proxied → in-place swaps are reactive).
class User {
  #tiles = $state<Array<DomainInventoryTile>>([]);

  #selectedTile = $state<DomainInventoryTile | null>(null);

  get selectedTile(): DomainInventoryTile | null {
    return this.#selectedTile;
  }

  get selectedTileIsPlaced(): boolean {
    return this.#selectedTile !== null && mainStore.isTilePlaced(this.#selectedTile);
  }

  get tiles(): ReadonlyArray<DomainInventoryTile> {
    return this.#tiles;
  }

  deselectTile(): void {
    this.#selectedTile = null;
  }

  initialize(): void {
    this.#tiles = [...mainStore.userTiles];
    this.#selectedTile = null;
  }

  isTileInToolbar(tile: DomainInventoryTile): boolean {
    return this.#getTileIdx(tile) !== -1;
  }

  isTileSelected(tile: DomainInventoryTile): boolean {
    return this.#selectedTile !== null && mainStore.areTilesSame(this.#selectedTile, tile);
  }

  selectTile(tile: DomainInventoryTile): void {
    if (this.#getTileIdx(tile) === -1) return;
    this.#selectedTile = tile;
  }

  shuffleTiles(): void {
    mainStore.shuffleUserTiles();
    this.#tiles = [...mainStore.userTiles];
  }

  switchTiles(firstTile: DomainInventoryTile, secondTile: DomainInventoryTile): void {
    const firstIdx = this.#getTileIdx(firstTile);
    const secondIdx = this.#getTileIdx(secondTile);
    if (firstIdx < 0 || secondIdx < 0) {
      throw new Error(`cannot switch tiles: ${firstTile} or ${secondTile} is not in inventory`);
    }
    const first = this.#tiles[firstIdx];
    const second = this.#tiles[secondIdx];
    if (first === undefined || second === undefined) {
      throw new Error(`expected tiles at indices ${String(firstIdx)} and ${String(secondIdx)}, got undefined`);
    }
    this.#tiles[firstIdx] = second;
    this.#tiles[secondIdx] = first;
  }

  #getTileIdx(tile: DomainInventoryTile): number {
    return this.#tiles.indexOf(tile);
  }
}

export default new User();
