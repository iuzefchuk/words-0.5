<script lang="ts">
  import { fly } from 'svelte/transition';
  import LayoutHeaderSettings from '@/client/components/by-hierarchy/Layout/LayoutHeader/LayoutHeaderSettings.svelte';
  import LayoutHeaderStats from '@/client/components/by-hierarchy/Layout/LayoutHeader/LayoutHeaderStats.svelte';
  import { TransitionDuration } from '@/client/enums.ts';
  import main from '@/client/runes/main.svelte.ts';
</script>

<header class="header">
  {#if main.settingsChangeIsAllowed}
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
