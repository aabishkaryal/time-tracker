<script lang="ts">
	import SideBar from '$lib/components/sideBar.svelte';
	import Timer from '$lib/components/timer.svelte';
	import { categoryStore, currentCategoryStore } from '$lib/store';
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/tauri';

	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import type { Category } from '$lib/types/category';
	import { toast } from 'svelte-sonner';
	dayjs.extend(duration);

	onMount(async () => {
		try {
			const categories: Category[] = await invoke('get_all_categories_command');
			if (categories.length === 0) {
				const defaultCategory: Category = { name: 'Default', icon: 'star', time: 0 };
				await invoke('add_category_command', defaultCategory);
				categories.push(defaultCategory);
			}
			categoryStore.set(categories);
			currentCategoryStore.set(categories[0]);
		} catch (err) {
			toast.error(`error initializing application, ${err}`);
		}
	});
</script>

<div class="h-screen w-screen flex flex-col">
	<header class="bg-gray-900 text-white py-4 px-6">
		<h1 class="text-2xl font-bold">Time Tracker</h1>
	</header>
	<main class="flex flex-row flex-1">
		<SideBar />
		<Timer />
	</main>
</div>
