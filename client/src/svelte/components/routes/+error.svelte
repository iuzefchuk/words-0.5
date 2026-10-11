<script lang="ts">
  import { resolve } from '$app/paths';
  import { ROUTES } from '@/client/constants.ts';
  import { RouteError } from '@/client/enums.ts';
  import I18nLibrary from '@/client/libraries/I18nLibrary.ts';

  type Props = { error: App.Error };

  const { error }: Props = $props();

  await I18nLibrary.loadNamespace('com_index_error');

  const message = $derived(getRouteErrorJson(error));

  function getRouteErrorJson({ code, message }: App.Error): string {
    switch (code) {
      case RouteError.NotFound:
        return I18nLibrary.t('com_index_error.not_found');
      case RouteError.ServerUnavailable:
        return I18nLibrary.t('com_index_error.server_unavailable');
      case RouteError.Unexpected:
        return I18nLibrary.t('com_index_error.unexpected', { error: message });
    }
  }
</script>

<div class="error">
  {#if error.code === RouteError.NotFound}
    <p>
      {@html message}
      <a href={resolve(ROUTES.Play)}>{I18nLibrary.t('com_index_error.link_play')}</a>
    </p>
  {:else}
    <p role="alert">{@html message}</p>
  {/if}
</div>

<style>
  .error {
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
</style>
