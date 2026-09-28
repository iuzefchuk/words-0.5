import { resolve } from 'node:path';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, loadEnv } from 'vite';
import type { UserConfig } from 'vite';

const ROOT = import.meta.dirname;

const REPO = resolve(ROOT, '..');

export default defineConfig(({ command, mode }) => {
  const config = {
    envDir: REPO,
    plugins: [
      sveltekit({
        adapter: adapter({ fallback: 'index.html', pages: `${ROOT}/dist` }),
        alias: { '@/client': `${ROOT}/src`, '@/engine': `${REPO}/engine/src` },
        compilerOptions: { experimental: { async: true } },
        files: { appTemplate: `${ROOT}/src/svelte/app.html`, routes: `${ROOT}/src/svelte/components/routes` },
        preprocess: vitePreprocess({ script: true }),
      }),
    ],
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
