<script lang="ts">
  import main from '@/interface/runes/main.svelte.ts';
  const ADDED_PERCENTAGE = 25;
  const displayedPercentage = $derived(main.bootProgress ? main.bootProgress + ADDED_PERCENTAGE : 0);
</script>

<progress
  class="progress"
  value={main.bootProgress}
  max="100"
  aria-label="Boot progress"
  style="--boot-progress: {displayedPercentage}%"
></progress>

<style>
  .progress {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    display: block;
    width: var(--boot-progress, 0%);
    height: 2px;
    appearance: none;
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-long);
    transition-property: width;

    &,
    &::-webkit-progress-value,
    &::-moz-progress-bar {
      background: var(--color-primary);
    }

    &::-webkit-progress-bar {
      background: transparent;
    }
  }
</style>
