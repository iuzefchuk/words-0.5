<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { TransitionDuration } from '@/client/src/fw/definitions/TransitionDuration.ts';
  import toast, { TheToastAccent } from '@/client/src/fw/headless/runes/per-app/for-component/TheToast.svelte.ts';
  import AppBanner, { AppBannerAccent } from '@/client/src/fw/ui/by-design/AppBanner.svelte';

  const DURATION = 5000;

  function mapTheToastAccentAppBannerAccent(accent: TheToastAccent): AppBannerAccent {
    return {
      [TheToastAccent.Bad]: AppBannerAccent.Bad,
      [TheToastAccent.Good]: AppBannerAccent.Good,
    }[accent];
  }

  $effect(() => {
    void toast.triggerCount;
    if (toast.body === null) return;
    const timeout = setTimeout(() => {
      toast.dismiss();
    }, DURATION);
    return () => {
      clearTimeout(timeout);
    };
  });
</script>

<div role="status" class="toast">
  {#if toast.body !== null}
    {#key toast.triggerCount}
      <div
        class="toast__item"
        in:fly|global={{ duration: TransitionDuration.Normal, y: '-1rem' }}
        out:fade|global={{ duration: TransitionDuration.Normal }}
      >
        <AppBanner
          --banner-shadow="var(--box-shadow-lvl-2)"
          accent={mapTheToastAccentAppBannerAccent(toast.accent)}
          body={toast.body}
          ontrigger={() => {
            toast.dismiss();
          }}
        />
      </div>
    {/key}
  {/if}
</div>

<style>
  .toast {
    position: fixed;
    top: var(--padding-primary);
    right: 0;
    left: 0;
    z-index: var(--z-index-lvl-2);
    display: grid;
    place-items: start stretch;
    padding: 0 var(--padding-primary);
    pointer-events: none;
  }

  .toast__item {
    display: grid;
    grid-area: 1 / 1;
    pointer-events: auto;
  }
</style>
