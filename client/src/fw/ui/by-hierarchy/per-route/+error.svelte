<script lang="ts">
  import { resolve } from '$app/paths';
  import { RouteError } from '@/client/src/fw/definitions/RouteError.ts';
  import { ROUTES } from '@/client/src/fw/definitions/ROUTES.ts';
  import I18nJsonAdapter from '@/client/src/platform/infra/i18n/adapters/json.ts';

  type Props = { error: App.Error };

  const { error }: Props = $props();

  await I18nJsonAdapter.loadNamespace('com_index_error');

  const message = $derived(getRouteErrorJson(error));

  function getRouteErrorJson({ code, message }: App.Error): string {
    switch (code) {
      case RouteError.NotFound:
        return I18nJsonAdapter.t('com_index_error.not_found');
      case RouteError.ServerUnavailable:
        return I18nJsonAdapter.t('com_index_error.server_unavailable');
      case RouteError.Unexpected:
        return I18nJsonAdapter.t('com_index_error.unexpected', { error: message });
    }
  }
</script>

<div class="error">
  {#if error.code === RouteError.NotFound}
    <p class="error__message">
      {@html message}
      <a class="error__link" href={resolve(ROUTES.Play)}>{I18nJsonAdapter.t('com_index_error.link_play')}</a>
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
    color: light-dark(var(--color-level-11), var(--color-level-1));
    background: light-dark(var(--color-level-1), var(--color-level-11));

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
