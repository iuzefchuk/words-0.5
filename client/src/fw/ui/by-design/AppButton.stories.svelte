<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AppButton, { AppButtonAccent } from '@/client/src/fw/ui/by-design/AppButton.svelte';

  const { Story: STORY } = defineMeta({ component: AppButton });
</script>

<STORY name="Primary accent, enabled, short text" args={{ accent: AppButtonAccent.Primary, text: 'Play' }} />

<STORY name="Primary accent, disabled, short text" args={{ accent: AppButtonAccent.Primary, isDisabled: true, text: 'Play' }} />

<STORY name="Primary accent, enabled, long text" args={{ accent: AppButtonAccent.Primary, text: 'Start a new match' }} />

<STORY
  name="Primary accent, disabled, long text"
  args={{ accent: AppButtonAccent.Primary, isDisabled: true, text: 'Start a new match' }}
/>

<STORY name="Secondary accent, enabled, short text" args={{ accent: AppButtonAccent.Secondary, text: 'Pass' }} />

<STORY
  name="Secondary accent, disabled, short text"
  args={{ accent: AppButtonAccent.Secondary, isDisabled: true, text: 'Pass' }}
/>

<STORY name="Secondary accent, enabled, long text" args={{ accent: AppButtonAccent.Secondary, text: 'Back to the board' }} />

<STORY
  name="Secondary accent, disabled, long text"
  args={{ accent: AppButtonAccent.Secondary, isDisabled: true, text: 'Back to the board' }}
/>
