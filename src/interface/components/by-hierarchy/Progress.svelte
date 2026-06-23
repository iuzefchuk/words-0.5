<script lang="ts">
  import mainStore from '@/interface/runes/main.svelte.ts';
</script>

<progress
  class="progress"
  value={mainStore.bootProgress}
  max="100"
  aria-label="Boot progress"
  style="

--boot-progress: {mainStore.bootProgress}%"
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
    transition-duration: var(--transition-duration);
    transition-property: width;

    &,
    &::-webkit-progress-value,
    &::-moz-progress-bar {
      background: var(--progress-color);
    }

    &::-webkit-progress-bar {
      background: transparent;
    }
  }
</style>
