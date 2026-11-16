<script module lang="ts">
  import L10nGlobAdapter from '@/client/src/platform/by-port/l10n/adapters/glob.ts';

  await L10nGlobAdapter.loadNamespace('com_the_dialog');
</script>

<script lang="ts">
  import '@/client/assets/css/box_shadow.css';
  import '@/client/assets/css/font_size.css';
  import '@/client/assets/css/font_weight.css';
  import '@/client/assets/css/keyframes.css';
  import '@/client/assets/css/palette.css';
  import '@/client/assets/css/space.css';
  import '@/client/assets/css/transition_timing_function.css';
  import '@/client/assets/css/z_index.css';
  import { TransitionDuration } from '@/client/src/fw/definitions/TransitionDuration.ts';
  import TheDialog from '@/client/src/fw/ui/by-hierarchy/per-app/TheDialog.svelte';
  import TheToast from '@/client/src/fw/ui/by-hierarchy/per-app/TheToast.svelte';
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
  <TheToast />
</div>

<style>
  :global {
    :root {
      color-scheme: light dark;

      --color-lvl-0: var(--palette-white);
      --color-lvl-1: var(--palette-slate-50);
      --color-lvl-2: var(--palette-slate-100);
      --color-lvl-3: var(--palette-slate-200);
      --color-lvl-4: var(--palette-slate-300);
      --color-lvl-5: var(--palette-slate-400);
      --color-lvl-6: var(--palette-slate-500);
      --color-lvl-7: var(--palette-slate-600);
      --color-lvl-8: var(--palette-slate-700);
      --color-lvl-9: var(--palette-slate-800);
      --color-lvl-10: var(--palette-slate-900);
      --color-lvl-11: var(--palette-slate-950);

      @media (prefers-color-scheme: dark) {
        --color-lvl-0: var(--palette-gray-950);
        --color-lvl-1: var(--palette-gray-900);
        --color-lvl-2: var(--palette-gray-800);
        --color-lvl-3: var(--palette-gray-700);
        --color-lvl-4: var(--palette-gray-600);
        --color-lvl-5: var(--palette-gray-500);
        --color-lvl-6: var(--palette-gray-400);
        --color-lvl-7: var(--palette-gray-300);
        --color-lvl-8: var(--palette-gray-200);
        --color-lvl-9: var(--palette-gray-100);
        --color-lvl-10: var(--palette-gray-50);
        --color-lvl-11: var(--palette-white);
      }

      --color-primary: light-dark(var(--color-lvl-11), var(--color-lvl-9));
      --color-secondary: var(--color-lvl-6);
      --box-shadow-color: light-dark(var(--color-lvl-11), var(--color-lvl-7));

      --bg-primary: light-dark(var(--color-lvl-3), var(--color-lvl-2));
      --bg-secondary: transparent;

      --font-size-primary: var(--font-size);
      --font-size-secondary: var(--font-size-small);

      --font-weight-primary: light-dark(var(--font-weight), var(--font-weight-small));
      --font-weight-secondary: var(--font-weight-primary);

      --padding-primary: var(--space-m);

      --gap-grid: var(--space-2xs);

      --radius-grid: var(--space-2xs);

      --outline: 2px solid var(--color-lvl-10);

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
