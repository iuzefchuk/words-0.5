import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  compilerOptions: { experimental: { async: true } },
  preprocess: vitePreprocess(),
};
