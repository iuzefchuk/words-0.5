<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import LayoutFooter from '@/interface/components/by-hierarchy/Layout/LayoutFooter/LayoutFooter.svelte';
  import LayoutHeader from '@/interface/components/by-hierarchy/Layout/LayoutHeader/LayoutHeader.svelte';
  import LayoutMain from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMain.svelte';
  import LayoutRestart from '@/interface/components/by-hierarchy/Layout/LayoutRestart.svelte';
  import { Key } from '@/interface/enums.ts';
  import dialogStore from '@/interface/runes/dialog.svelte.ts';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import userStore from '@/interface/runes/user.svelte.ts';

  let isMounted = $state(false);

  function onKeydown(event: KeyboardEvent): void {
    if ((event.key as Key) !== Key.Escape) return;
    if (dialogStore.isOpen) return;
    userStore.deselectTile();
  }

  onMount(() => {
    window.addEventListener('keydown', onKeydown);
    void tick().then(() => {
      isMounted = true;
    });
    return () => {
      window.removeEventListener('keydown', onKeydown);
    };
  });
</script>

{#if isMounted}
  <div
    class="layout"
    class:layout--inactive={mainStore.matchIsFinished}
    style:--grid-items-per-axis={mainStore.playfieldCellsPerAxis}
    role="presentation"
    onclick={() => userStore.deselectTile()}
  >
    <h1 class="app__make-sr-only">Words</h1>
    <LayoutHeader />
    <LayoutMain />
    <LayoutFooter />
  </div>
{/if}
{#if mainStore.matchIsFinished}
  <div transition:fade={{ duration: 250 }}>
    <LayoutRestart />
  </div>
{/if}

<style>
  .layout {
    display: grid;
    grid-template-rows: 1fr auto 1fr;
    gap: var(--space-s);
    place-items: center center;
    width: 100%;
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration);
    transition-property: opacity;
  }

  .layout--inactive {
    opacity: 0.5;
  }
</style>
