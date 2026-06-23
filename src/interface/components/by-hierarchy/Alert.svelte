<script lang="ts">
  type Props = { html: string };
  const { html }: Props = $props();
</script>

<div class="alert" role="alert"><p>{@html html}</p></div>

<style>
  .alert {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: var(--z-index-level-3);
    display: grid;
    place-items: center;
    width: 100vh;
    height: 100vh;
    padding: var(--layout-padding);
    color: var(--alert-color);
    background: var(--alert-bg);

    :global(em) {
      font-style: italic;
    }
  }
</style>
