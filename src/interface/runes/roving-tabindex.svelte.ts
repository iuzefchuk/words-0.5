import { tick } from 'svelte';
import { Key } from '@/interface/enums.ts';

export default class RovingTabindex {
  #focusedIndex = $state(0);

  readonly #getGrid: () => HTMLElement | null;

  readonly #itemSelector: string;

  readonly #itemsPerRow: number;

  constructor(getGrid: () => HTMLElement | null, itemSelector: string, itemsPerRow: number) {
    this.#getGrid = getGrid;
    this.#itemSelector = itemSelector;
    this.#itemsPerRow = itemsPerRow;
  }

  get focusedIndex(): number {
    return this.#focusedIndex;
  }

  readonly onKeydown = (event: KeyboardEvent): void => {
    const items = this.#getGrid()?.querySelectorAll<HTMLElement>(this.#itemSelector);
    if (items === undefined) throw new Error('RovingTabindex: grid is not mounted');
    if (items.length === 0) throw new Error(`RovingTabindex: no items match "${this.#itemSelector}"`);
    const total = items.length;
    let target = this.#focusedIndex;
    switch (event.key as Key) {
      case Key.ArrowDown:
        target += this.#itemsPerRow;
        break;
      case Key.ArrowLeft:
        target -= 1;
        break;
      case Key.ArrowRight:
        target += 1;
        break;
      case Key.ArrowUp:
        target -= this.#itemsPerRow;
        break;
      case Key.End:
        target = total - 1;
        break;
      case Key.Home:
        target = 0;
        break;
      case Key.Enter:
      case Key.Escape:
      case Key.P:
      case Key.R:
      case Key.Space:
      default:
        return;
    }
    event.preventDefault();
    const clamped = Math.min(Math.max(target, 0), total - 1);
    if (clamped === this.#focusedIndex) return;
    this.#focusedIndex = clamped;
    void tick().then(() => {
      items[clamped]?.focus();
    });
  };
}
