import '@/client/assets/css/index.css';
import { mount } from 'svelte';
import Index from '@/client/svelte/components/by-hierarchy/index.svelte';

const target = document.getElementById('app');
if (target === null) throw new Error('mount target #app not found');
mount(Index, { target });
