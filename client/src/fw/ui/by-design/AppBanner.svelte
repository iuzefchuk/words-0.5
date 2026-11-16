<script module lang="ts">
  export enum AppBannerAccent {
    Bad = 'Bad',
    Good = 'Good',
  }
</script>

<script lang="ts">
  type Props = {
    accent: AppBannerAccent;
    body: string;
    ontrigger?: () => void;
  };

  const { accent, body, ontrigger }: Props = $props();

  const icon = $derived(mapAppBannerAccentIcon(accent));

  function mapAppBannerAccentIcon(value: AppBannerAccent): string {
    return {
      [AppBannerAccent.Bad]: '✘',
      [AppBannerAccent.Good]: '✔︎',
    }[value];
  }

  function onClick(): void {
    ontrigger?.();
  }
</script>

<button
  type="button"
  class="banner"
  class:banner--accent-bad={accent === AppBannerAccent.Bad}
  class:banner--accent-good={accent === AppBannerAccent.Good}
  onclick={onClick}
>
  <span aria-hidden="true">{icon}</span>
  <span class="banner__body">{@html body}</span>
</button>

<style>
  .banner {
    display: grid;
    grid-template-columns: auto auto;
    gap: var(--space-s);
    align-items: start;
    justify-content: center;
    padding: var(--space-m) var(--space-l);
    margin: 0;
    font-family: inherit;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight);
    line-height: 1.4;
    text-align: center;
    appearance: none;
    cursor: pointer;
    user-select: none;
    border: none;
    border-radius: var(--space-xs);
    box-shadow: var(--banner-shadow, none);
  }

  .banner__body {
    max-width: 32rem;
  }

  .banner--accent-bad {
    color: light-dark(var(--palette-red-800), var(--palette-red-200));
    background: light-dark(var(--palette-red-200), var(--palette-red-950));
  }

  .banner--accent-good {
    color: light-dark(var(--palette-green-800), var(--palette-green-200));
    background: light-dark(var(--palette-green-200), var(--palette-green-950));
  }
</style>
