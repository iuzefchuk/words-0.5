<script lang="ts">
  import '@/client/assets/css/index.css';
  import favicon from '@/client/assets/svg/favicon.svg';
  import Index from '@/client/svelte/components/routes/Index.svelte';
  import type { Snippet } from 'svelte';

  type Props = { children: Snippet };
  const { children }: Props = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Index>{@render children()}</Index>
