import ColorSchemeSplit from '@/client/.storybook/ColorSchemeSplit.svelte';
import Root from '@/client/src/fw/ui/by-hierarchy/per-app/index.svelte';
import type { ProjectAnnotations, Renderer } from 'storybook/internal/types';

document.body.id = 'app';

export default {
  decorators: [(_, { id }) => ({ Component: ColorSchemeSplit, props: { storyId: id } }), () => ({ Component: Root })],
  parameters: { layout: 'fullscreen' },
} satisfies ProjectAnnotations<Renderer>;
