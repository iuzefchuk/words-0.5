<script module lang="ts">
  import L10nGlobAdapter from '@/client/src/platform/by-port/l10n/adapters/glob.ts';

  await L10nGlobAdapter.loadNamespace('com_index_error');

  function comIndexError(key: string, props?: Record<string, number | string>): string {
    return L10nGlobAdapter.t(`com_index_error.${key}`, props);
  }
</script>

<script lang="ts">
  import { resolve } from '$app/paths';
  import { RouteError } from '@/client/src/fw/definitions/RouteError.ts';
  import { ROUTES } from '@/client/src/fw/definitions/ROUTES.ts';

  type Props = { error: App.Error };

  const { error }: Props = $props();

  const message = $derived(getRouteErrorJson(error));

  function getRouteErrorJson({ code, message }: App.Error): string {
    switch (code) {
      case RouteError.NotFound:
        return comIndexError('not_found');
      case RouteError.ServerUnavailable:
        return comIndexError('server_unavailable');
      case RouteError.Unexpected:
        return comIndexError('unexpected', { error: message });
    }
  }
</script>

<div class="error">
  {#if error.code === RouteError.NotFound}
    <p class="error__message">
      {@html message}
      <a class="error__link" href={resolve(ROUTES.Play)}>{comIndexError('link_play')}</a>
    </p>
  {:else}
    <p class="error__message" role="alert">{@html message}</p>
  {/if}
</div>

<style>
  .error {
    box-sizing: border-box;
    display: grid;
    place-items: center;
    min-height: 100vh;
    padding: var(--padding-primary);
    color: light-dark(var(--color-lvl-11), var(--color-lvl-10));
    background: light-dark(var(--color-lvl-1), var(--color-lvl-0));

    :global(em) {
      font-style: italic;
    }
  }

  .error__message {
    margin: 0;
  }

  .error__link {
    color: inherit;
    text-decoration: none;
    cursor: auto;
  }
</style>
