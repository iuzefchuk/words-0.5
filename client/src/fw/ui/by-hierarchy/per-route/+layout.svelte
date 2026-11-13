<script lang="ts">
  import favicon from '@/client/assets/svg/original_tile.svg';
  import Index from '@/client/src/fw/ui/by-hierarchy/per-app/index.svelte';
  import type { LayoutProps } from './$types';

  const { children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Index>{@render children()}</Index>
