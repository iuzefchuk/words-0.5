<script lang="ts">
  import { fly } from 'svelte/transition';
  import { TransitionDuration } from '@/client/enums.ts';
  import PlayMainBoard from '@/client/svelte/components/routes/play/PlayMain/PlayMainBoard/PlayMainBoard.svelte';
  import PlayMainLog from '@/client/svelte/components/routes/play/PlayMain/PlayMainLog.svelte';
  import PlayMainToolbar from '@/client/svelte/components/routes/play/PlayMain/PlayMainToolbar/PlayMainToolbar.svelte';
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
    width: 100%;
    max-width: 34rem;
    padding: var(--padding-primary);
  }
</style>
