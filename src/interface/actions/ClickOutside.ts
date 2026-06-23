import type { Action } from 'svelte/action';

// Invokes a callback on pointer events that land outside the node.
class ClickOutside {
  #callback: () => void;

  readonly #node: HTMLElement;

  readonly #frameId: number;

  constructor(node: HTMLElement, callback: () => void) {
    this.#node = node;
    this.#callback = callback;
    this.#frameId = window.requestAnimationFrame(() => {
      document.addEventListener('click', this.#onEvent);
      document.addEventListener('touchstart', this.#onEvent);
    });
  }

  destroy(): void {
    window.cancelAnimationFrame(this.#frameId);
    document.removeEventListener('click', this.#onEvent);
    document.removeEventListener('touchstart', this.#onEvent);
  }

  update(callback: () => void): void {
    this.#callback = callback;
  }

  readonly #onEvent = (event: Event): void => {
    const target = event.target as Node;
    if (this.#node !== target && !this.#node.contains(target)) this.#callback();
  };
}

const clickOutside: Action<HTMLElement, () => void> = (node, callback) => {
  const instance = new ClickOutside(node, callback);
  return {
    destroy: () => {
      instance.destroy();
    },
    update: next => {
      instance.update(next);
    },
  };
};

export default clickOutside;
