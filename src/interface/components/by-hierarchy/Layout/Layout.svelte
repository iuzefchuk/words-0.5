<script lang="ts">
  import { onMount, tick } from 'svelte';
  import LayoutFooter from '@/interface/components/by-hierarchy/Layout/LayoutFooter/LayoutFooter.svelte';
  import LayoutHeader from '@/interface/components/by-hierarchy/Layout/LayoutHeader/LayoutHeader.svelte';
  import LayoutMain from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMain.svelte';
  import { Key } from '@/interface/enums.ts';
  import dialog from '@/interface/runes/dialog.svelte.ts';
  import main from '@/interface/runes/main.svelte.ts';
  import user from '@/interface/runes/user.svelte.ts';

  let isMounted = $state(false);

  function onKeydown(event: KeyboardEvent): void {
    if ((event.key as Key) !== Key.Escape) return;
    if (dialog.isOpen) return;
    user.deselectTile();
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
    class:layout--inactive={main.matchIsFinished}
    style:--grid-items-per-axis={main.playfieldCellsPerAxis}
    role="presentation"
    onclick={() => user.deselectTile()}
  >
    <h1 class="app__hidden">Words</h1>
    <LayoutHeader />
    <LayoutMain />
    <LayoutFooter />
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
    transition-duration: var(--transition-duration-normal);
    transition-property: opacity;
  }

  .layout--inactive {
    filter: blur(var(--space-2xs));
  }
</style>
