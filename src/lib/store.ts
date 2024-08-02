import type { Dayjs } from 'dayjs';
import { writable } from 'svelte/store';

export const currentTimeStore = writable<{ start: Dayjs } | null>(null);
