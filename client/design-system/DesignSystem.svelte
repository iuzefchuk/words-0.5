<script module lang="ts">
  import toast, { TheToastAccent } from '@/client/src/fw/headless/runes/per-app/for-component/TheToast.svelte.ts';
  import AppBanner, { AppBannerAccent } from '@/client/src/fw/ui/by-design/AppBanner.svelte';
  import AppBlock, { AppBlockElevation, AppBlockTone } from '@/client/src/fw/ui/by-design/AppBlock.svelte';
  import AppButton, { AppButtonAccent } from '@/client/src/fw/ui/by-design/AppButton.svelte';
  import AppModal from '@/client/src/fw/ui/by-design/AppModal.svelte';
  import AppRadioGroup from '@/client/src/fw/ui/by-design/AppRadioGroup.svelte';
  import Index from '@/client/src/fw/ui/by-hierarchy/per-app/index.svelte';
  import type { ComponentProps, Snippet } from 'svelte';

  type Axis = ReadonlyArray<{ name: string; props: object }>;

  const BANNER_BODIES: Axis = [
    { name: 'body: short', props: { body: 'Saved' } },
    { name: 'body: mid', props: { body: 'This word is not in the dictionary.' } },
    {
      name: 'body: long',
      props: {
        body: 'The server could not be reached, so your last turn was kept on this device and will be sent again as soon as the connection is back.',
      },
    },
  ];

  const AXES: Record<string, ReadonlyArray<Axis>> = {
    AppBanner: [
      [
        { name: 'accent: bad', props: { accent: AppBannerAccent.Bad } },
        { name: 'accent: good', props: { accent: AppBannerAccent.Good } },
      ],
      BANNER_BODIES,
    ],
    AppBlock: [
      [
        { name: 'elevation: low', props: { elevation: AppBlockElevation.Low } },
        { name: 'elevation: mid', props: { elevation: AppBlockElevation.Mid } },
        { name: 'elevation: high', props: { elevation: AppBlockElevation.High } },
      ],
      [
        { name: 'text: none', props: {} },
        { name: 'text: 2L', props: { text: '2L' } },
        { name: 'text: A', props: { ariaLabel: 'A letter', text: 'A' } },
        { name: 'text: A, textSecondary: 1', props: { ariaLabel: 'A letter / 1 pts', text: 'A', textSecondary: '1' } },
        { name: 'text: Q, textSecondary: 10', props: { ariaLabel: 'Q letter / 10 pts', text: 'Q', textSecondary: '10' } },
        { name: 'text: W, textSecondary: 4', props: { ariaLabel: 'W letter / 4 pts', text: 'W', textSecondary: '4' } },
      ],
      [
        { name: 'tone: none', props: {} },
        { name: 'tone: faint', props: { tone: AppBlockTone.Faint } },
        { name: 'tone: mid', props: { tone: AppBlockTone.Mid } },
        { name: 'tone: bold', props: { tone: AppBlockTone.Bold } },
        { name: 'tone: bolder', props: { tone: AppBlockTone.Bolder } },
      ],
    ],
    AppButton: [
      [
        { name: 'text: short', props: { text: 'Play' } },
        { name: 'text: long', props: { text: 'Start a new match' } },
      ],
      [
        { name: 'accent: primary', props: { accent: AppButtonAccent.Primary } },
        { name: 'accent: secondary', props: { accent: AppButtonAccent.Secondary } },
      ],
      [
        { name: 'isDisabled: false', props: { isDisabled: false } },
        { name: 'isDisabled: true', props: { isDisabled: true } },
      ],
    ],
    AppModal: [
      [
        { name: 'title: none', props: {} },
        { name: 'title: short', props: { title: 'Pass?' } },
        { name: 'title: long', props: { title: 'Pass this turn and let your opponent play next?' } },
      ],
      [
        { name: 'body: short', props: { body: 'You will lose if you pass twice in a row.' } },
        { name: 'body: emoji', props: { body: 'You won by 42 pts 🏆' } },
        {
          name: 'body: markup',
          props: { body: 'Opponent played <em>ZAX</em> for 19 pts.<br />You will lose if you pass twice in a row.' },
        },
        {
          name: 'body: long',
          props: {
            body: 'Passing hands the turn to your opponent without placing any tiles. If both of you pass twice in a row, the match ends and the higher score wins, so passing now may cost you the lead you built over the last few turns.',
          },
        },
      ],
      [
        { name: 'cancelText: short, confirmText: short', props: { cancelText: 'No', confirmText: 'Yes' } },
        { name: 'cancelText: long, confirmText: long', props: { cancelText: 'Keep playing', confirmText: 'Pass this turn' } },
      ],
      [
        { name: 'isDestructive: false', props: { isDestructive: false } },
        { name: 'isDestructive: true', props: { isDestructive: true } },
      ],
    ],
    AppRadioGroup: [
      [
        { name: 'legend: short, options: 1 short', props: { legend: 'Engine', options: toOptions(['Client']) } },
        {
          name: 'legend: short, options: 2 short',
          props: { legend: 'Engine', options: toOptions(['Client', 'Server']) },
        },
        {
          name: 'legend: long, options: 2 long',
          props: {
            legend: 'How bonus squares are spread across the board',
            options: toOptions(['Classic symmetric layout', 'Shuffled every match']),
          },
        },
        {
          name: 'legend: short, options: 3 short',
          props: { legend: 'Difficulty', options: toOptions(['Beginner', 'Average', 'Challenging']) },
        },
        {
          name: 'legend: short, options: 5 short',
          props: { legend: 'Turn time', options: toOptions(['15s', '30s', '60s', '2m', 'Off']) },
        },
      ],
      [
        { name: 'modelValue: 1st', props: { index: 0 } },
        { name: 'modelValue: 2nd', props: { index: 1 } },
        { name: 'modelValue: 3rd', props: { index: 2 } },
      ],
    ],
    TheToast: [
      [
        { name: 'accent: bad', props: { accent: TheToastAccent.Bad } },
        { name: 'accent: good', props: { accent: TheToastAccent.Good } },
      ],
      BANNER_BODIES,
    ],
  };

  const COLOR_SCHEMES = ['light', 'dark'];

  function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function getCases(axes: ReadonlyArray<Axis>): Array<{ name: string; props: object }> {
    return axes
      .reduce<Array<{ names: Array<string>; props: object }>>(
        (cases, axis) =>
          cases.flatMap(base =>
            axis.map(variant => ({ names: [...base.names, variant.name], props: { ...base.props, ...variant.props } })),
          ),
        [{ names: [], props: {} }],
      )
      .map(({ names, props }) => ({ name: capitalize(names.join(', ')), props }));
  }

  function toOptions(texts: Array<string>): Array<{ text: string; value: string }> {
    return texts.map(text => ({ text, value: text }));
  }
</script>

<script lang="ts">
  const params = new URLSearchParams(window.location.search);
  if (params.has('frame')) document.body.id = 'app';
  const requested = params.get('component') ?? '';
  const component = Object.hasOwn(AXES, requested) ? requested : (Object.keys(AXES)[0] ?? '');
  const items: Record<string, Snippet<[never, string]>> = {
    AppBanner: appBanner,
    AppBlock: appBlock,
    AppButton: appButton,
    AppModal: appModal,
    AppRadioGroup: appRadioGroup,
    TheToast: theToast,
  };
  const modals: Record<string, { open: () => void }> = {};
  const selectedValues = $state<Record<string, string>>({});
  const selfTitled = ['AppModal', 'TheToast'];
</script>

{#snippet appBanner(props: ComponentProps<typeof AppBanner>)}
  <AppBanner {...props} />
{/snippet}

{#snippet appBlock(props: ComponentProps<typeof AppBlock>)}
  <div class="tile"><AppBlock {...props} /></div>
{/snippet}

{#snippet appButton(props: ComponentProps<typeof AppButton>)}
  <AppButton {...props} />
{/snippet}

{#snippet appModal(props: ComponentProps<typeof AppModal>, name: string)}
  <button
    type="button"
    onclick={() => {
      modals[name]?.open();
    }}
  >
    {name}
  </button>
  <AppModal bind:this={modals[name]} {...props} />
{/snippet}

{#snippet appRadioGroup(props: { index: number; legend: string; options: Array<{ text: string; value: string }> }, name: string)}
  <AppRadioGroup
    legend={props.legend}
    modelValue={selectedValues[name] ?? props.options[props.index]?.value ?? ''}
    options={props.options}
    onchange={value => {
      selectedValues[name] = value;
    }}
  />
{/snippet}

{#snippet theToast(props: { accent: TheToastAccent; body: string }, name: string)}
  <button
    type="button"
    onclick={() => {
      toast.trigger(props);
    }}
  >
    {name}
  </button>
{/snippet}

{#if params.has('frame')}
  <Index>
    <dl>
      {#each getCases(AXES[component] ?? []) as { name, props } (name)}
        {#if !selfTitled.includes(component)}<dt>{name}</dt>{/if}
        <dd>{@render items[component]?.(props as never, name)}</dd>
      {/each}
    </dl>
  </Index>
{:else}
  <div class="shell">
    <nav class="shell__nav">
      <ul>
        {#each Object.keys(AXES) as name (name)}
          <li>
            {#if name === component}
              <strong>{name}</strong>
            {:else}
              <a href="?component={name}">{name}</a>
            {/if}
          </li>
        {/each}
      </ul>
    </nav>
    <main class="shell__main">
      {#each COLOR_SCHEMES as colorScheme (colorScheme)}
        <iframe
          title="{component}, {colorScheme}"
          class="shell__frame"
          style:color-scheme={colorScheme}
          src="?component={component}&frame"
        ></iframe>
      {/each}
    </main>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
  }

  dl {
    padding: var(--space-m);
    margin: 0;
  }

  dd {
    margin: var(--space-xs) 0 var(--space-l);
  }

  .tile {
    width: var(--space-4xl);
    border-radius: var(--radius-grid);
  }

  .shell {
    display: grid;
    grid-template-columns: max-content 1fr;
    height: 100dvh;
    font-family: monospace;
  }

  .shell__nav {
    padding-right: var(--space-l);
    overflow-y: auto;
  }

  .shell__main {
    display: grid;
    grid-template-rows: 1fr 1fr;
    min-width: 0;
    min-height: 0;
  }

  .shell__frame {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  }
</style>
