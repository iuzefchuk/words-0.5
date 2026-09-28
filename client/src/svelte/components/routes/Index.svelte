<script lang="ts">
  import { TransitionDuration } from '@/client/enums.ts';
  import IndexDialog from '@/client/svelte/components/routes/IndexDialog.svelte';
  import type { Snippet } from 'svelte';

  type Props = { children: Snippet };
  const { children }: Props = $props();
</script>

<div
  style:display="contents"
  style:--transition-duration-long="{TransitionDuration.Long}ms"
  style:--transition-duration-normal="{TransitionDuration.Normal}ms"
  style:--transition-duration-short="{TransitionDuration.Short}ms"
>
  {@render children()}
  <IndexDialog />
</div>
