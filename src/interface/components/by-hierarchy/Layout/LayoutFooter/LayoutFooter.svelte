<script lang="ts">
  import LayoutFooterMenubar from '@/interface/components/by-hierarchy/Layout/LayoutFooter/LayoutFooterMenubar.svelte';
  import LayoutFooterToolbar from '@/interface/components/by-hierarchy/Layout/LayoutFooter/LayoutFooterToolbar/LayoutFooterToolbar.svelte';
</script>

<footer class="footer">
  <LayoutFooterToolbar />
  <LayoutFooterMenubar />
</footer>

<style>
  .footer {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 1px 2fr 1px;
    place-self: flex-end center;
    align-items: center;
    width: 100%;
    overflow-x: hidden;

    @media screen and (width <= 34rem) {
      grid-template-rows: repeat(2, 1fr);
      grid-template-columns: 1fr;
    }
  }
</style>
