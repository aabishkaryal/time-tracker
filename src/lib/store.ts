import type { Dayjs } from 'dayjs';
import { writable } from 'svelte/store';
import type { Category } from './types/category';

export const categoryStore = writable<Category[]>([]);

export const currentCategoryStore = writable<Category | null>(null);

export const currentTimeStore = writable<{ start: Dayjs } | null>(null);
