import { writable } from 'svelte/store';
import type { Category } from './types/category';
import type { Dayjs } from 'dayjs';

export const categoryStore = writable<Category[]>([]);

export const currentCategoryStore = writable<Category | null>(null);

export const currentTimeStore = writable<{ start: Dayjs } | null>(null);
