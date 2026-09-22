import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin, UserConfig } from 'vite';

const ROOT = process.cwd();

const resolvePort = (mode: string): number => {
  const value = loadEnv(mode, ROOT, '')['VITE_PORT'];
  if (value === undefined) throw new Error('VITE_PORT must be defined.');
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) throw new Error('VITE_PORT is invalid.');
  return port;
};

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
      outDir: `${ROOT}/dist`,
      target: 'esnext',
    },
    cacheDir: `${ROOT}/node_modules/.vite`,
    envDir: ROOT,
    plugins: [svelte({ configFile: `${ROOT}/svelte.config.ts` }), crossOriginIsolation()],
    publicDir: `${ROOT}/public`,
    resolve: {
      alias: { '@': `${ROOT}/src` },
      tsconfigPaths: true,
    },
    root: `${ROOT}/src/interface`,
    server: {
      port: resolvePort(mode),
      strictPort: true,
    },
    worker: {
      format: 'es',
    },
  } satisfies UserConfig;
});
