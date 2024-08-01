<script lang="ts">
	import { EVENT_CATEGORY_LIST_UPDATED } from '$lib/event_names';
	import { subscribe, unsubscribe } from '$lib/events';
	import type { Category } from '$lib/types/category';
	import { invoke } from '@tauri-apps/api';
	import dayjs from 'dayjs';
	import { onDestroy, onMount } from 'svelte';

	let archivedCategories: Category[] = [];

	async function refreshArchivedCategories() {
		archivedCategories = await invoke('get_archived_categories_info_command', {
			date: dayjs().format('YYYY-MM-DD')
		});
	}

	onMount(() => {
		refreshArchivedCategories();
		subscribe(EVENT_CATEGORY_LIST_UPDATED, refreshArchivedCategories);
	});

	onDestroy(() => {
		unsubscribe(EVENT_CATEGORY_LIST_UPDATED, refreshArchivedCategories);
	});
</script>

<div class="rounded-md border"></div>
