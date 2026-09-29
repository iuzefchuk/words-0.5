<script lang="ts">
  import '@/client/assets/css/index.css';
  import favicon from '@/client/assets/svg/favicon.svg';
  import Index from '@/client/svelte/components/routes/Index.svelte';
  import type { LayoutProps } from './$types';

  const { children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Index>{@render children()}</Index>
