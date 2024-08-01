<script lang="ts">
	import { EVENT_CATEGORY_LIST_UPDATED } from '$lib/event_names';
	import { subscribe, unsubscribe } from '$lib/events';
	import type { Category } from '$lib/types/category';
	import dayjs from 'dayjs';
	import { onDestroy, onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/tauri';

	let categories: Category[] = [];

	async function refresh() {
		categories = await invoke('get_active_categories_info_command', {
			date: dayjs().format('YYYY-MM-DD')
		});
	}

	onMount(() => {
		refresh();
		subscribe(EVENT_CATEGORY_LIST_UPDATED, refresh);
	});

	onDestroy(() => {
		unsubscribe(EVENT_CATEGORY_LIST_UPDATED, refresh);
	});

	$: totalTime = dayjs
		.duration(
			categories.reduce((sum, c) => sum + c.time, 0),
			's'
		)
		.format('HH:mm:ss');
</script>

<div class="mt-8 w-full max-w-md">
	<h3 class="text-lg font-medium mb-2">Today's Summary</h3>
	<div class="bg-white shadow-lg rounded-lg p-4">
		{#each categories as c (c.name + c.time)}
			<div class="flex justify-between mb-2">
				<span>{c.name}</span>
				<span>{dayjs.duration(c.time, 's').format('HH:mm:ss')}</span>
			</div>
		{/each}
		<div class="border-t border-gray-200 pt-2 flex justify-between">
			<span class="font-medium">Total</span>
			<span class="font-medium">{totalTime}</span>
		</div>
	</div>
</div>
