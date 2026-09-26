import { resolve } from 'node:path';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, loadEnv } from 'vite';
import type { UserConfig } from 'vite';

const ROOT = import.meta.dirname;

const REPO = resolve(ROOT, '..');

export default defineConfig(({ command, mode }) => {
  const config = {
    build: { emptyOutDir: true, outDir: `${ROOT}/dist` },
    envDir: REPO,
    plugins: [
      svelte({
        compilerOptions: { experimental: { async: true } },
        configFile: false,
        preprocess: vitePreprocess({ script: true }),
      }),
    ],
    resolve: { alias: { '@/client': `${ROOT}/src`, '@/engine': `${REPO}/engine/src` } },
    root: `${ROOT}/src`,
  } satisfies UserConfig;
  if (command === 'build') return config;
  const env = loadEnv(mode, REPO, '');
  const proxy = { '/api': resolveServerUrl(env) };
  return {
    ...config,
    preview: { proxy },
    server: { fs: { allow: [ROOT, `${REPO}/engine`] }, port: resolvePort(env, 'CLIENT_PORT', 1234), proxy, strictPort: true },
  } satisfies UserConfig;
});

function resolvePort(env: Record<string, string>, name: string, fallback: number): number {
  const value = env[name];
  if (value === undefined || value === '') return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) throw new Error(`${name} is invalid.`);
  return port;
}

function resolveServerUrl(env: Record<string, string>): string {
  const host = env['SERVER_HOST'];
  const port = resolvePort(env, 'SERVER_PORT', 5678);
  return `http://${host === undefined || host === '' ? 'localhost' : host}:${String(port)}`;
}
