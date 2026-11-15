<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AppButton, { AppButtonAccent } from '@/client/src/fw/ui/by-design/AppButton.svelte';
  import AppModal from '@/client/src/fw/ui/by-design/AppModal.svelte';
  import type { ComponentProps } from 'svelte';

  const { Story: STORY } = defineMeta({ component: AppModal });
</script>

<script lang="ts">
  let modal = $state<{ open: () => void }>();

  $effect(() => {
    modal?.open();
  });
</script>

{#snippet template(args: ComponentProps<typeof AppModal>)}
  <AppButton
    accent={AppButtonAccent.Secondary}
    text="Open"
    ontrigger={() => {
      modal?.open();
    }}
  />
  <AppModal bind:this={modal} {...args} />
{/snippet}

<STORY
  name="Non-destructive, short title, one-sentence plain body, short button texts"
  args={{ body: 'You will lose if you pass twice in a row.', cancelText: 'No', confirmText: 'Yes', title: 'Pass?' }}
  {template}
/>

<STORY
  name="Destructive, short title, one-sentence plain body, short button texts"
  args={{
    body: 'Your opponent will automatically win.',
    cancelText: 'No',
    confirmText: 'Yes',
    isDestructive: true,
    title: 'Resign?',
  }}
  {template}
/>

<STORY
  name="Non-destructive, long title, one-sentence plain body, short button texts"
  args={{
    body: 'You will lose if you pass twice in a row.',
    cancelText: 'No',
    confirmText: 'Yes',
    title: 'Pass this turn and let your opponent play next?',
  }}
  {template}
/>

<STORY
  name="Destructive, long title, one-sentence plain body, short button texts"
  args={{
    body: 'Your opponent will automatically win.',
    cancelText: 'No',
    confirmText: 'Yes',
    isDestructive: true,
    title: 'Resign this match and give your opponent the win?',
  }}
  {template}
/>

<STORY
  name="Non-destructive, no title, one-sentence plain body, short button texts"
  args={{ body: 'You will lose if you pass twice in a row.', cancelText: 'No', confirmText: 'Yes' }}
  {template}
/>

<STORY
  name="Destructive, no title, one-sentence plain body, short button texts"
  args={{ body: 'Your opponent will automatically win.', cancelText: 'No', confirmText: 'Yes', isDestructive: true }}
  {template}
/>

<STORY
  name="Non-destructive, short title, one-sentence body with emoji, short button texts"
  args={{ body: 'You won by 42 pts 🏆', cancelText: 'No', confirmText: 'Yes', title: 'Start new match?' }}
  {template}
/>

<STORY
  name="Non-destructive, short title, two-sentence body with markup, short button texts"
  args={{
    body: 'Opponent played <em>ZAX</em> for 19 pts.<br />You will lose if you pass twice in a row.',
    cancelText: 'No',
    confirmText: 'Yes',
    title: 'Pass?',
  }}
  {template}
/>

<STORY
  name="Non-destructive, short title, paragraph plain body, short button texts"
  args={{
    body: 'Passing hands the turn to your opponent without placing any tiles. If both of you pass twice in a row, the match ends and the higher score wins, so passing now may cost you the lead you built over the last few turns.',
    cancelText: 'No',
    confirmText: 'Yes',
    title: 'Pass?',
  }}
  {template}
/>

<STORY
  name="Non-destructive, short title, one-sentence plain body, long button texts"
  args={{
    body: 'You will lose if you pass twice in a row.',
    cancelText: 'Keep playing',
    confirmText: 'Pass this turn',
    title: 'Pass?',
  }}
  {template}
/>
