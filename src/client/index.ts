import '@/client/assets/css/index.css';
import { mount } from 'svelte';
import Index from '@/client/components/by-hierarchy/index.svelte';
import TextLocalizer from '@/client/services/TextLocalizer.ts';

const target = document.getElementById('app');
if (target === null) throw new Error('mount target #app not found');
void (async (): Promise<void> => {
  await TextLocalizer.load();
  mount(Index, { target });
})();
