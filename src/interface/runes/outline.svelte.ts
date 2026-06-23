import mainStore from '@/interface/runes/main.svelte.ts';
import userStore from '@/interface/runes/user.svelte.ts';
import type { DomainInventoryTile, DomainPlayfieldCell } from '@/app/types/index.ts';

export type Bounds = { col: number; colSpan: number; row: number; rowSpan: number };

export default class Outline {
  readonly bounds = $derived.by((): ReadonlyArray<Bounds> => Outline.computeBounds(userStore.tiles));

  isAnchorAt(idx: number): boolean {
    if (mainStore.currentTurnScore === undefined) return false;
    let minRow = Infinity;
    let anchorIdx = -1;
    let rightmostEdge = -Infinity;
    for (let cursor = 0; cursor < this.bounds.length; cursor++) {
      const group = this.bounds[cursor];
      if (group === undefined) throw new ReferenceError(`expected bounds at index ${String(cursor)}, got undefined`);
      if (group.row < minRow) {
        minRow = group.row;
        anchorIdx = cursor;
        rightmostEdge = group.col + group.colSpan;
      } else if (group.row === minRow) {
        const edge = group.col + group.colSpan;
        if (edge > rightmostEdge) {
          anchorIdx = cursor;
          rightmostEdge = edge;
        }
      }
    }
    return idx === anchorIdx;
  }

  isOnRightmostColumnAt(idx: number): boolean {
    const group = this.bounds[idx];
    if (group === undefined) return false;
    return group.col + group.colSpan >= mainStore.playfieldCellsPerAxis;
  }

  private static computeBounds(tiles: ReadonlyArray<DomainInventoryTile>): ReadonlyArray<Bounds> {
    const cells = Outline.findCellsFor(tiles);
    if (cells.size === 0) return [];
    const visited = new Set<DomainPlayfieldCell>();
    const bounds: Array<Bounds> = [];
    for (const cell of cells) {
      if (visited.has(cell)) continue;
      bounds.push(Outline.floodFillBounds(cell, cells, visited));
    }
    return bounds;
  }

  private static findCellsFor(tiles: ReadonlyArray<DomainInventoryTile>): Set<DomainPlayfieldCell> {
    const cells = new Set<DomainPlayfieldCell>();
    for (const tile of tiles) {
      const cell = mainStore.findCellWithTile(tile);
      if (cell !== undefined) cells.add(cell);
    }
    return cells;
  }

  private static floodFillBounds(
    start: DomainPlayfieldCell,
    cells: ReadonlySet<DomainPlayfieldCell>,
    visited: Set<DomainPlayfieldCell>,
  ): Bounds {
    const stack: Array<DomainPlayfieldCell> = [start];
    visited.add(start);
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;
    while (stack.length > 0) {
      const cell = stack.pop();
      if (cell === undefined) throw new ReferenceError('expected cell from traversal stack, got undefined');
      const row = mainStore.getCellRowIndex(cell);
      const col = mainStore.getCellColumnIndex(cell);
      if (row < minRow) minRow = row;
      if (row > maxRow) maxRow = row;
      if (col < minCol) minCol = col;
      if (col > maxCol) maxCol = col;
      for (const adjacent of mainStore.getAdjacentCells(cell)) {
        if (!cells.has(adjacent) || visited.has(adjacent)) continue;
        visited.add(adjacent);
        stack.push(adjacent);
      }
    }
    return { col: minCol, colSpan: maxCol - minCol + 1, row: minRow, rowSpan: maxRow - minRow + 1 };
  }
}
