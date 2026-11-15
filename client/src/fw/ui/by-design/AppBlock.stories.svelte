<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AppBlock, { AppBlockElevation, AppBlockTone } from '@/client/src/fw/ui/by-design/AppBlock.svelte';
  import type { ComponentProps } from 'svelte';

  const { Story: STORY } = defineMeta({ component: AppBlock, render: template });
</script>

{#snippet template(args: ComponentProps<typeof AppBlock>)}
  <div class="frame">
    <AppBlock {...args} />
  </div>
{/snippet}

<STORY name="Low elevation, no tone, no text, no secondary text" args={{ elevation: AppBlockElevation.Low }} />

<STORY
  name="Low elevation, faint tone, text 2L, no secondary text"
  args={{ elevation: AppBlockElevation.Low, text: '2L', tone: AppBlockTone.Faint }}
/>

<STORY
  name="Low elevation, mid tone, text 3L, no secondary text"
  args={{ elevation: AppBlockElevation.Low, text: '3L', tone: AppBlockTone.Mid }}
/>

<STORY
  name="Low elevation, bold tone, text 2W, no secondary text"
  args={{ elevation: AppBlockElevation.Low, text: '2W', tone: AppBlockTone.Bold }}
/>

<STORY
  name="Low elevation, bolder tone, text 3W, no secondary text"
  args={{ elevation: AppBlockElevation.Low, text: '3W', tone: AppBlockTone.Bolder }}
/>

<STORY name="Mid elevation, no tone, no text, no secondary text" args={{ elevation: AppBlockElevation.Mid }} />

<STORY
  name="Mid elevation, faint tone, text 2L, no secondary text"
  args={{ elevation: AppBlockElevation.Mid, text: '2L', tone: AppBlockTone.Faint }}
/>

<STORY
  name="Mid elevation, mid tone, text 3L, no secondary text"
  args={{ elevation: AppBlockElevation.Mid, text: '3L', tone: AppBlockTone.Mid }}
/>

<STORY
  name="Mid elevation, bold tone, text 2W, no secondary text"
  args={{ elevation: AppBlockElevation.Mid, text: '2W', tone: AppBlockTone.Bold }}
/>

<STORY
  name="Mid elevation, bolder tone, text 3W, no secondary text"
  args={{ elevation: AppBlockElevation.Mid, text: '3W', tone: AppBlockTone.Bolder }}
/>

<STORY
  name="High elevation, faint tone, text A, secondary text 1"
  args={{
    ariaLabel: 'A letter / 1 pts',
    elevation: AppBlockElevation.High,
    text: 'A',
    textSecondary: '1',
    tone: AppBlockTone.Faint,
  }}
/>

<STORY
  name="High elevation, mid tone, text A, secondary text 1"
  args={{
    ariaLabel: 'A letter / 1 pts',
    elevation: AppBlockElevation.High,
    text: 'A',
    textSecondary: '1',
    tone: AppBlockTone.Mid,
  }}
/>

<STORY
  name="High elevation, bold tone, text A, secondary text 1"
  args={{
    ariaLabel: 'A letter / 1 pts',
    elevation: AppBlockElevation.High,
    text: 'A',
    textSecondary: '1',
    tone: AppBlockTone.Bold,
  }}
/>

<STORY
  name="High elevation, bolder tone, text A, secondary text 1"
  args={{
    ariaLabel: 'A letter / 1 pts',
    elevation: AppBlockElevation.High,
    text: 'A',
    textSecondary: '1',
    tone: AppBlockTone.Bolder,
  }}
/>

<STORY
  name="High elevation, mid tone, text Q, secondary text 10"
  args={{
    ariaLabel: 'Q letter / 10 pts',
    elevation: AppBlockElevation.High,
    text: 'Q',
    textSecondary: '10',
    tone: AppBlockTone.Mid,
  }}
/>

<STORY
  name="High elevation, mid tone, text W, secondary text 4"
  args={{
    ariaLabel: 'W letter / 4 pts',
    elevation: AppBlockElevation.High,
    text: 'W',
    textSecondary: '4',
    tone: AppBlockTone.Mid,
  }}
/>

<STORY
  name="High elevation, mid tone, text A, no secondary text"
  args={{ ariaLabel: 'A letter', elevation: AppBlockElevation.High, text: 'A', tone: AppBlockTone.Mid }}
/>

<STORY
  name="High elevation, mid tone, no text, no secondary text"
  args={{ elevation: AppBlockElevation.High, tone: AppBlockTone.Mid }}
/>

<style>
  .frame {
    width: var(--space-4xl);
    border-radius: var(--radius-grid);
  }
</style>
