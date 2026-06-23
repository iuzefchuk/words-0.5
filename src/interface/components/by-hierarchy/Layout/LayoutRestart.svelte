<script lang="ts">
  import { handleRestartGame } from '@/interface/handlers/restart.ts';
  import { getMatchResultText } from '@/interface/mappings.ts';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import TextLocalizer from '@/interface/services/TextLocalizer/TextLocalizer.ts';

  const ID_RESULT = 'result';
  const t = TextLocalizer.namespace('end');

  const result = $derived(getMatchResultText(mainStore.matchResult, mainStore.userScore - mainStore.opponentScore));

  function restart(): void {
    handleRestartGame();
  }

  function onDblClick(event: MouseEvent): void {
    event.stopPropagation();
    restart();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    restart();
  }
</script>

<div role="alertdialog" aria-modal="true" aria-labelledby={ID_RESULT} class="restart">
  <p id={ID_RESULT} role="status">{result}</p>
  <button class="restart__button app__secondary" ondblclick={onDblClick} onkeydown={onKeydown}>{t('new_match')}</button>
</div>

<style>
  .restart {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: oklch(0% 0 0deg / 40%);
  }

  .restart__button {
    display: grid;
    place-items: center;
    align-content: center;
    padding: var(--space-6xl);
    touch-action: manipulation;
    cursor: pointer;
    user-select: none;
  }
</style>
