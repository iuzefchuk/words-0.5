<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AppRadioGroup from '@/client/src/fw/ui/by-design/AppRadioGroup.svelte';
  import type { ComponentProps } from 'svelte';

  const { Story: STORY } = defineMeta({ component: AppRadioGroup });
</script>

<script lang="ts">
  let selectedValue = $state<string>();
</script>

{#snippet template(args: ComponentProps<typeof AppRadioGroup>)}
  <AppRadioGroup
    {...args}
    modelValue={selectedValue ?? args.modelValue}
    onchange={value => {
      selectedValue = value;
    }}
  />
{/snippet}

<STORY
  name="One option, first selected, short legend, short option texts"
  args={{ legend: 'Engine', modelValue: 'client', options: [{ text: 'Client', value: 'client' }] }}
  {template}
/>

<STORY
  name="Two options, first selected, short legend, short option texts"
  args={{
    legend: 'Bonus distribution',
    modelValue: 'classic',
    options: [
      { text: 'Classic', value: 'classic' },
      { text: 'Random', value: 'random' },
    ],
  }}
  {template}
/>

<STORY
  name="Two options, second selected, short legend, short option texts"
  args={{
    legend: 'Engine',
    modelValue: 'server',
    options: [
      { text: 'Client', value: 'client' },
      { text: 'Server', value: 'server' },
    ],
  }}
  {template}
/>

<STORY
  name="Two options, first selected, long legend, long option texts"
  args={{
    legend: 'How bonus squares are spread across the board',
    modelValue: 'classic',
    options: [
      { text: 'Classic symmetric layout', value: 'classic' },
      { text: 'Shuffled every match', value: 'random' },
    ],
  }}
  {template}
/>

<STORY
  name="Three options, first selected, short legend, short option texts"
  args={{
    legend: 'Difficulty',
    modelValue: 'low',
    options: [
      { text: 'Beginner', value: 'low' },
      { text: 'Average', value: 'medium' },
      { text: 'Challenging', value: 'high' },
    ],
  }}
  {template}
/>

<STORY
  name="Three options, second selected, short legend, short option texts"
  args={{
    legend: 'Difficulty',
    modelValue: 'medium',
    options: [
      { text: 'Beginner', value: 'low' },
      { text: 'Average', value: 'medium' },
      { text: 'Challenging', value: 'high' },
    ],
  }}
  {template}
/>

<STORY
  name="Three options, third selected, short legend, short option texts"
  args={{
    legend: 'Difficulty',
    modelValue: 'high',
    options: [
      { text: 'Beginner', value: 'low' },
      { text: 'Average', value: 'medium' },
      { text: 'Challenging', value: 'high' },
    ],
  }}
  {template}
/>

<STORY
  name="Five options, third selected, short legend, short option texts"
  args={{
    legend: 'Turn time',
    modelValue: '60',
    options: [
      { text: '15s', value: '15' },
      { text: '30s', value: '30' },
      { text: '60s', value: '60' },
      { text: '2m', value: '120' },
      { text: 'Off', value: 'off' },
    ],
  }}
  {template}
/>
