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
    padding: var(--padding-primary);
    color: light-dark(var(--color-level-11), var(--color-level-1));
    background: light-dark(var(--color-level-1), var(--color-level-11));

    :global(em) {
      font-style: italic;
    }
  }
</style>
