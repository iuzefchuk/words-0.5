import TextLocalizer from '@/interface/services/TextLocalizer/TextLocalizer.ts';
import type { Action } from 'svelte/action';

export type AnimateNumberParams = { animationDelay?: number; animationDuration?: number; number: number };

// Tweens an element's textContent toward a target number across animation frames.
class AnimateNumber {
  private frameId: number | undefined;

  private value: number;

  private readonly node: HTMLElement;

  constructor(node: HTMLElement, params: AnimateNumberParams) {
    this.node = node;
    this.value = params.number;
    this.animate(0, params);
  }

  destroy(): void {
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
  }

  update(params: AnimateNumberParams): void {
    if (params.number === this.value) return;
    this.animate(this.value, params);
    this.value = params.number;
  }

  private animate(from: number, params: AnimateNumberParams): void {
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
    const startTime = performance.now() + (params.animationDelay ?? 0);
    const duration = params.animationDuration ?? 500;
    const target = params.number;
    const frame = (now: number): void => {
      if (now < startTime) {
        this.frameId = requestAnimationFrame(frame);
        return;
      }
      const progress = Math.min((now - startTime) / duration, 1);
      const unfinished = progress < 1;
      const next = unfinished ? Math.floor(from + (target - from) * progress) : target;
      this.node.textContent = TextLocalizer.number(next);
      if (unfinished) this.frameId = requestAnimationFrame(frame);
    };
    this.frameId = requestAnimationFrame(frame);
  }
}

const animateNumber: Action<HTMLElement, AnimateNumberParams> = (node, params) => {
  if (params === undefined) throw new Error('animateNumber: params are required');
  const instance = new AnimateNumber(node, params);
  return {
    destroy: () => {
      instance.destroy();
    },
    update: next => {
      instance.update(next);
    },
  };
};

export default animateNumber;
