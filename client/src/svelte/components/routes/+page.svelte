<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { ROUTES } from '@/client/constants.ts';

  onMount(() => {
    void goto(resolve(ROUTES.Play), { replaceState: true });
  });
</script>
