<script lang="ts" generics="T extends string">
  import { onMount, tick } from 'svelte';

  type Option = { text: string; value: T };

  type Props = {
    legend: string;
    modelValue: T;
    onchange?: (value: T) => void;
    options: Array<Option>;
  };

  const { legend, modelValue, onchange, options }: Props = $props();

  const inputName = $props.id();
  let labelEls = $state<Array<HTMLLabelElement | undefined>>([]);
  let indicatorStyle = $state('transform: translateX(0); width: 0;');
  let isMounted = $state(false);

  function updateIndicator(): void {
    const selectedIdx = options.findIndex(option => option.value === modelValue);
    const label = labelEls[selectedIdx];
    if (label === undefined) return;
    indicatorStyle = `transform: translateX(${String(label.offsetLeft + 1)}px); width: ${String(label.offsetWidth - 1)}px;`;
  }

  onMount(() => {
    void tick().then(() => {
      updateIndicator();
      isMounted = true;
    });
  });

  $effect(() => {
    void modelValue;
    void tick().then(updateIndicator);
  });
</script>

<fieldset class="radio-group">
  <legend class="radio-group__legend app__secondary">{legend}</legend>
  <div class="radio-group__option-group">
    {#if isMounted}
      <div class="radio-group__indicator" style={indicatorStyle}></div>
    {/if}
    {#each options as option, index (option.value)}
      <label
        bind:this={labelEls[index]}
        class="radio-group__option"
        class:radio-group__option--selected={option.value === modelValue}
      >
        <input
          type="radio"
          class="radio-group__input"
          name={inputName}
          value={option.value}
          checked={option.value === modelValue}
          onchange={() => onchange?.(option.value)}
        />
        {option.text}
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .radio-group__legend {
    margin-block-end: var(--space-s);
    margin-left: var(--space-3xs);
  }

  .radio-group__option-group {
    position: relative;
    display: inline-flex;
    gap: var(--space-3xs);
    align-items: stretch;
    height: var(--space-5xl);
    padding: var(--space-3xs);
    background: light-dark(var(--color-level-4), var(--color-level-8));
    border-radius: var(--space-s);
  }

  .radio-group__indicator {
    position: absolute;
    top: var(--space-3xs);
    bottom: var(--space-3xs);
    left: 0;
    pointer-events: none;
    background: light-dark(var(--color-level-1), var(--color-level-7));
    border-radius: calc(var(--space-xs) + 2px);
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-short);
    transition-property: transform, width;
  }

  .radio-group__option {
    position: relative;
    display: grid;
    place-items: center;
    padding: var(--space-xs) var(--space-l);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight);
    color: light-dark(var(--color-level-7), var(--color-level-5));
    cursor: pointer;
    user-select: none;
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-short);
    transition-property: color;

    &:hover {
      color: light-dark(var(--color-level-10), var(--color-level-1));
    }

    &:has(:focus-visible) {
      outline: var(--outline);
    }
  }

  .radio-group__option--selected {
    color: light-dark(var(--color-level-9), var(--color-level-3));
    cursor: default;
  }

  .radio-group__input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
  }
</style>
