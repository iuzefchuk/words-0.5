import { resolve } from 'node:path';
import { mergeConfig } from 'vite';
import type { StorybookConfig } from '@storybook/sveltekit/node';

const ROOT = resolve(import.meta.dirname, '..');

export default {
  addons: ['@storybook/addon-svelte-csf'],
  core: { disableTelemetry: true },
  features: {
    actions: false,
    controls: false,
    interactions: false,
    menuOnboardingChecklist: false,
    sidebarOnboardingChecklist: false,
  },
  framework: '@storybook/sveltekit',
  stories: ['../src/fw/ui/by-design/*.stories.svelte'],
  viteFinal(config) {
    return mergeConfig(config, { server: { fs: { allow: [ROOT] } } });
  },
} satisfies StorybookConfig;
