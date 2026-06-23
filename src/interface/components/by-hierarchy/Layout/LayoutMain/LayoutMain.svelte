<script lang="ts">
  import LayoutMainGrid from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainGrid/LayoutMainGrid.svelte';
  import LayoutMainLog from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainLog.svelte';
</script>

<main class="main">
  <LayoutMainLog />
  <LayoutMainGrid />
</main>

<style>
  .main {
    position: relative;
    width: 100%;
    max-width: 34rem;
    padding: var(--padding-primary);
  }
</style>
