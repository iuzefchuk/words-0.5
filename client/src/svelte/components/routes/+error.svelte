<script lang="ts">
  import { resolve } from '$app/paths';
  import { ROUTES } from '@/client/constants.ts';
  import { ErrorCode } from '@/client/enums.ts';
  import LocalesService from '@/client/services/LocalesService.ts';

  type Props = { error: App.Error };

  const { error }: Props = $props();

  await Promise.all([LocalesService.loadNamespace('com_index_error'), LocalesService.loadNamespace('map_error_code_message')]);

  const message = $derived(mapErrorCodeMessage(error));

  function mapErrorCodeMessage({ code, message }: App.Error): string {
    switch (code) {
      case ErrorCode.NotFound:
        return LocalesService.t('map_error_code_message.not_found');
      case ErrorCode.ServerUnavailable:
        return LocalesService.t('map_error_code_message.server_unavailable');
      case ErrorCode.Unexpected:
        return LocalesService.t('map_error_code_message.unexpected', { error: message });
    }
  }
</script>

<div class="error">
  {#if error.code === ErrorCode.NotFound}
    <p>
      {@html message}
      <a href={resolve(ROUTES.Play)}>{LocalesService.t('com_index_error.link_play')}</a>
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
