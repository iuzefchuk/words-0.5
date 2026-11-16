<script lang="ts">
  type Props = {
    ontrigger?: () => void;
    opponentName: string;
    opponentScore: number;
    userName: string;
    userScore: number;
  };

  const { ontrigger, opponentName, opponentScore, userName, userScore }: Props = $props();

  function onClick(): void {
    ontrigger?.();
  }
</script>

<button type="button" class="play" onclick={onClick}>
  <span class="play__name">{userName}</span>
  <span class="play__score">{userScore}</span>
  <span class="play__divider" aria-hidden="true">:</span>
  <span class="play__score">{opponentScore}</span>
  <span class="play__name play__name--opponent">{opponentName}</span>
</button>

<style>
  .play {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr auto auto auto 1fr;
    gap: var(--space-xs);
    align-items: center;
    width: 100%;
    height: var(--space-5xl);
    padding: 0 var(--space-m);
    margin: 0;
    font-family: inherit;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight);
    color: inherit;
    appearance: none;
    cursor: pointer;
    user-select: none;
    background: oklch(from var(--color-primary) l c h / 5%);
    border: none;
    border-radius: var(--space-xs);
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-short);
    transition-property: background;

    &:active {
      background: oklch(from var(--color-primary) l c h / 15%);
    }

    &:hover:not(:active) {
      background: oklch(from var(--color-primary) l c h / 10%);
    }
  }

  .play__name {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-secondary);
    text-align: start;
    white-space: nowrap;
  }

  .play__name--opponent {
    text-align: end;
  }

  .play__score {
    font-weight: var(--font-weight-big);
    font-variant-numeric: tabular-nums;
  }

  .play__divider {
    color: var(--color-secondary);
  }
</style>
