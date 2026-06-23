import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { DIRECTORY } from './meta/constants.ts';
import EnvVariableFinder from './meta/EnvVariableFinder.ts';
import type { Plugin, UserConfig } from 'vite';

const crossOriginIsolation = (): Plugin => {
  const setHeaders = (res: { setHeader(name: string, value: string): void }): void => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  };
  return {
    configurePreviewServer(server): void {
      server.middlewares.use((_, res, next) => {
        setHeaders(res);
        next();
      });
    },
    configureServer(server): void {
      server.middlewares.use((_, res, next) => {
        setHeaders(res);
        next();
      });
    },
    name: 'cross-origin-isolation',
  };
};

export default defineConfig(({ mode }) => {
  return {
    build: {
      chunkSizeWarningLimit: 1_000,
      emptyOutDir: true,
      outDir: DIRECTORY.dist,
      target: 'esnext',
    },
    // Keep Vite's dep cache at the project root, not under the src/interface root.
    cacheDir: `${DIRECTORY.root}/node_modules/.vite`,
    envDir: DIRECTORY.root,
    plugins: [svelte({ configFile: `${DIRECTORY.root}/svelte.config.ts` }), crossOriginIsolation()],
    publicDir: DIRECTORY.public,
    resolve: {
      tsconfigPaths: true,
    },
    root: DIRECTORY.srcInterface,
    server: {
      port: EnvVariableFinder.getFromConfig('VITE_PORT', {
        envDir: DIRECTORY.root,
        mode,
        parse: value => Number(value),
        validate: value => !Number.isInteger(value) || value <= 0,
      }),
      strictPort: true,
    },
    worker: {
      format: 'es',
    },
  } satisfies UserConfig;
});
