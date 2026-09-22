import TextLocalizer from '@/interface/services/locales/TextLocalizer.ts';
import type { Action } from 'svelte/action';

export type Params = { animationDelay?: number; animationDuration?: number; number: number };

const animateNumber: Action<HTMLElement, Params> = (node, initialParams) => {
  let frameId: number | undefined;
  let value = initialParams.number;

  const animate = (from: number, params: Params): void => {
    if (frameId !== undefined) cancelAnimationFrame(frameId);
    const startTime = performance.now() + (params.animationDelay ?? 0);
    const duration = params.animationDuration ?? 500;
    const target = params.number;
    const frame = (now: number): void => {
      if (now < startTime) {
        frameId = requestAnimationFrame(frame);
        return;
      }
      const progress = Math.min((now - startTime) / duration, 1);
      const unfinished = progress < 1;
      const next = unfinished ? Math.floor(from + (target - from) * progress) : target;
      node.textContent = TextLocalizer.number(next);
      if (unfinished) frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);
  };

  animate(0, initialParams);

  return {
    destroy: () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
    },
    update: params => {
      if (params.number === value) return;
      animate(value, params);
      value = params.number;
    },
  };
};

export default animateNumber;
