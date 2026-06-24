<script lang="ts">
  import LayoutMainBoard from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainBoard/LayoutMainBoard.svelte';
  import LayoutMainLog from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainLog.svelte';
</script>

<main class="main">
  <LayoutMainLog />
  <LayoutMainBoard />
</main>

<style>
  .main {
    position: relative;
    width: 100%;
    max-width: 34rem;
    padding: var(--padding-primary);
  }
</style>
