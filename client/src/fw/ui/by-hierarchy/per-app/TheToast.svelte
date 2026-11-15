<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { TransitionDuration } from '@/client/src/fw/definitions/TransitionDuration.ts';
  import toast from '@/client/src/fw/headless/runes/per-app/for-component/TheToast.svelte.ts';
  import AppBanner from '@/client/src/fw/ui/by-design/AppBanner.svelte';

  const DURATION = 5000;

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
    z-index: var(--z-index-level-2);
    display: grid;
    place-items: center;
    padding: 0 var(--padding-primary);
    pointer-events: none;
  }

  .toast__item {
    grid-area: 1 / 1;
    pointer-events: auto;
  }
</style>
