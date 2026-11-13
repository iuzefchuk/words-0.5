<script lang="ts">
  import { fly } from 'svelte/transition';
  import { TransitionDuration } from '@/client/src/fw/definitions/TransitionDuration.ts';
  import PlayMainBoard from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayMain/PlayMainBoard/PlayMainBoard.svelte';
  import PlayMainLog from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayMain/PlayMainLog.svelte';
  import PlayMainToolbar from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayMain/PlayMainToolbar/PlayMainToolbar.svelte';
</script>

<main class="main">
  <PlayMainLog />
  <PlayMainBoard />
  <div transition:fly|global={{ duration: TransitionDuration.Normal, y: '1rem' }}>
    <PlayMainToolbar />
  </div>
</main>

<style>
  .main {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-width: 34rem;
    padding: var(--padding-primary);
  }
</style>
