<script lang="ts">
  type Props = {
    body: string;
    ontrigger?: () => void;
  };

  const { body, ontrigger }: Props = $props();

  function onClick(): void {
    ontrigger?.();
  }
</script>

<button type="button" class="banner" onclick={onClick}>{@html body}</button>

<style>
  .banner {
    display: grid;
    place-items: center;
    padding: var(--space-s) var(--space-m);
    margin: 0;
    font-family: inherit;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-small);
    color: light-dark(var(--color-level-2), var(--color-level-8));
    text-align: center;
    appearance: none;
    cursor: pointer;
    user-select: none;
    background: light-dark(var(--color-level-8), var(--color-level-2));
    border: none;
    border-radius: var(--space-xs);
  }
</style>
