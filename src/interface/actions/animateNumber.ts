import { prefersReducedMotion } from 'svelte/motion';
import { TransitionDuration } from '@/interface/enums.ts';
import TextLocalizer from '@/interface/services/TextLocalizer.ts';
import type { ActionReturn } from 'svelte/action';

export type Params = { animationDelay?: number; animationDuration?: number; number: number };

export default function animateNumber(node: HTMLElement, params: Params): ActionReturn<Params> {
  let displayed: number | undefined;
  let frameId: number | undefined;
  let target = params.number;
  let timeoutId: Timeout | undefined;

  function render(value: number): void {
    if (value === displayed) return;
    displayed = value;
    node.textContent = TextLocalizer.number(value);
  }

  function destroy(): void {
    clearTimeout(timeoutId);
    if (frameId !== undefined) cancelAnimationFrame(frameId);
  }

  function animate({ animationDelay = 0, animationDuration = TransitionDuration.Long, number: to }: Params): void {
    destroy();
    if (prefersReducedMotion.current) {
      render(to);
      return;
    }
    const from = displayed ?? 0;
    render(from);
    if (from === to) return;
    let startTime: number | undefined;

    function frame(now: number): void {
      startTime ??= now;
      const elapsed = now - startTime;
      if (elapsed >= animationDuration) {
        render(to);
        return;
      }
      render(Math.round(from + (to - from) * (elapsed / animationDuration)));
      frameId = requestAnimationFrame(frame);
    }

    function start(): void {
      frameId = requestAnimationFrame(frame);
    }

    if (animationDelay > 0) timeoutId = setTimeout(start, animationDelay);
    else start();
  }

  function update(next: Params): void {
    if (next.number === target) return;
    target = next.number;
    animate(next);
  }

  animate(params);

  return { destroy, update };
}
