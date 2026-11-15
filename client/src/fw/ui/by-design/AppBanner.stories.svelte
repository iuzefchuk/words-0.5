<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AppBanner from '@/client/src/fw/ui/by-design/AppBanner.svelte';

  const { Story: STORY } = defineMeta({ component: AppBanner });
</script>

<STORY name="One-word plain body" args={{ body: 'Saved' }} />

<STORY name="One-sentence plain body" args={{ body: 'This word is not in the dictionary.' }} />

<STORY
  name="Paragraph plain body"
  args={{
    body: 'The server could not be reached, so your last turn was kept on this device and will be sent again as soon as the connection is back.',
  }}
/>

<STORY name="One-sentence body with bold markup" args={{ body: '<b>QI</b> is worth 11 pts.' }} />

<STORY name="One-sentence body with emphasis markup" args={{ body: 'Opponent played <em>ZAX</em> for 19 pts' }} />

<STORY name="One-sentence body with emoji" args={{ body: 'You won by 42 pts 🏆' }} />
