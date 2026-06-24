<script lang="ts">
  import { fly } from 'svelte/transition';
  import LayoutHeaderSettings from '@/interface/components/by-hierarchy/Layout/LayoutHeader/LayoutHeaderSettings.svelte';
  import LayoutHeaderStats from '@/interface/components/by-hierarchy/Layout/LayoutHeader/LayoutHeaderStats.svelte';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import { TransitionDuration } from '@/interface/enums.ts';
</script>

<header class="header">
  {#if mainStore.settingsChangeIsAllowed}
    <div transition:fly|global={{ duration: TransitionDuration.Normal, y: '-1rem' }}><LayoutHeaderSettings /></div>
  {:else}
    <div transition:fly|global={{ duration: TransitionDuration.Normal, y: '-1rem' }}><LayoutHeaderStats /></div>
  {/if}
</header>

<style>
  .header {
    place-self: flex-start flex-start;
    width: 100%;
    padding: var(--padding-primary);
  }
</style>
