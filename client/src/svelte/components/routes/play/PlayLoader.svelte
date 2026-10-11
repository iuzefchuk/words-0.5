<script lang="ts">
  const DOTS = Array.from({ length: 3 }, () => '•');
</script>

<p class="loader" style:--dot-count={DOTS.length} aria-hidden="true">
  {#each DOTS as dot, idx (idx)}
    <span class="loader__dot" style:--dot-index={idx}>{dot}</span>
  {/each}
</p>

<style>
  .loader {
    display: flex;
    grid-row: 2;
    gap: var(--space-3xs);
    font-size: 2rem;
  }

  .loader__dot {
    animation: pulse calc(var(--transition-duration-normal) * var(--dot-count)) var(--transition-timing-function) infinite
      backwards;
    animation-delay: calc(var(--dot-index) * var(--transition-duration-normal));
  }
</style>
