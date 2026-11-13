<script module lang="ts">
  import { createContext } from 'svelte';
  import type { default as PlayRuntime } from '@/client/src/fw/headless/runes/per-instance/PlayRuntime.svelte.ts';

  export const [getPlayRuntimeContext, setPlayRuntimeContext] = createContext<PlayRuntime>();
</script>

<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { fly } from 'svelte/transition';
  import { Key } from '@/client/src/fw/definitions/Key.ts';
  import { TransitionDuration } from '@/client/src/fw/definitions/TransitionDuration.ts';
  import dialog from '@/client/src/fw/headless/runes/per-app/for-component/TheDialog.svelte.ts';
  import PlayHeader from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayHeader/PlayHeader.svelte';
  import PlayMain from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayMain/PlayMain.svelte';
  import PlayMenubar from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayMenubar.svelte';
  import type { PlayHostType } from '@/client/src/domain/play.ts';

  type Props = {
    onsethosttype: (hostType: PlayHostType) => void;
    runtime: PlayRuntime;
  };

  const { onsethosttype, runtime }: Props = $props();

  setPlayRuntimeContext(untrack(() => runtime));

  function onClick(): void {
    runtime.deselectBlock();
  }

  function onKeydown(event: KeyboardEvent): void {
    if ((event.key as Key) !== Key.Escape) return;
    if (dialog.isOpen) return;
    runtime.deselectBlock();
  }

  onMount(() => {
    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('keydown', onKeydown);
    };
  });
</script>

<div
  class="play"
  class:play--inactive={runtime.isFinished}
  style:--grid-slots-per-axis={runtime.slotsPerAxis}
  role="presentation"
  onclick={onClick}
>
  <div class="play__header" transition:fly|global={{ duration: TransitionDuration.Normal, y: '-1rem' }}>
    <PlayHeader {onsethosttype} />
  </div>
  <PlayMain />
  <div class="play__menubar" transition:fly|global={{ duration: TransitionDuration.Normal, x: '1rem' }}>
    <PlayMenubar />
  </div>
</div>

<style>
  .play {
    display: grid;
    grid-template-rows: 1fr auto 1fr;
    gap: var(--space-s);
    place-items: center center;
    width: 100%;
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
    overflow-x: clip;
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-normal);
    transition-property: opacity;
  }

  .play__header {
    place-self: flex-start flex-start;
    width: 100%;
  }

  .play__menubar {
    z-index: var(--z-index-level-1);
    place-self: end end;

    @media screen and (width <= 34rem) {
      width: 100%;
    }
  }

  .play--inactive {
    filter: blur(var(--space-2xs));
  }
</style>
