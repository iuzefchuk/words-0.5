import '@/interface/assets/style/index.css';
import { mount } from 'svelte';
import Index from '@/interface/components/by-hierarchy/index.svelte';
import TextLocalizer from '@/interface/services/TextLocalizer/TextLocalizer.ts';

const target = document.getElementById('app');
if (target === null) throw new Error('mount target #app not found');
void (async (): Promise<void> => {
  await TextLocalizer.load();
  mount(Index, { target });
})();
