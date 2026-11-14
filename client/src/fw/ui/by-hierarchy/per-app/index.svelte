<script lang="ts">
  import '@/client/assets/css/font_size.css';
  import '@/client/assets/css/font_weight.css';
  import '@/client/assets/css/keyframes.css';
  import '@/client/assets/css/palette.css';
  import '@/client/assets/css/shadow.css';
  import '@/client/assets/css/space.css';
  import '@/client/assets/css/transition_timing_function.css';
  import '@/client/assets/css/z_index.css';
  import { TransitionDuration } from '@/client/src/fw/definitions/TransitionDuration.ts';
  import TheDialog from '@/client/src/fw/ui/by-hierarchy/per-app/TheDialog.svelte';
  import type { Snippet } from 'svelte';

  type Props = { children: Snippet };
  const { children }: Props = $props();
</script>

<div
  style:display="contents"
  style:--transition-duration-long="{TransitionDuration.Long}ms"
  style:--transition-duration-normal="{TransitionDuration.Normal}ms"
  style:--transition-duration-short="{TransitionDuration.Short}ms"
>
  {@render children()}
  <TheDialog />
</div>

<style>
  :global {
    :root {
      color-scheme: light dark;

      --color-level-0: var(--palette-white);
      --color-level-1: var(--palette-gray-50);
      --color-level-2: var(--palette-gray-100);
      --color-level-3: var(--palette-gray-200);
      --color-level-4: var(--palette-gray-300);
      --color-level-5: var(--palette-gray-400);
      --color-level-6: var(--palette-gray-500);
      --color-level-7: var(--palette-gray-600);
      --color-level-8: var(--palette-gray-700);
      --color-level-9: var(--palette-gray-800);
      --color-level-10: var(--palette-gray-900);
      --color-level-11: var(--palette-gray-950);
      --color-primary: light-dark(var(--color-level-11), var(--color-level-2));
      --color-secondary: light-dark(var(--color-level-6), var(--color-level-5));
      --bg-primary: light-dark(var(--color-level-3), var(--color-level-9));
      --bg-secondary: transparent;
      --font-size-primary: var(--font-size);
      --font-size-secondary: var(--font-size-small);
      --font-weight-primary: light-dark(var(--font-weight), var(--font-weight-small));
      --font-weight-secondary: var(--font-weight-primary);
      --padding-primary: var(--space-m);
      --gap-grid: var(--space-2xs);
      --radius-grid: var(--space-2xs);
      --outline: 2px solid light-dark(var(--color-level-10), var(--color-level-1));

      :focus-visible {
        outline: var(--outline);
      }
    }

    html {
      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        'Helvetica Neue',
        Arial,
        'Noto Sans',
        sans-serif,
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji';
    }

    text {
      fill: currentcolor;
    }

    #app {
      margin: 0;
      font-size: var(--font-size-primary);
      font-weight: var(--font-weight-primary);
      color: var(--color-primary);
      background: var(--bg-primary);
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
      }
    }

    :focus:not(:focus-visible) {
      outline: none;
    }
  }
</style>
