<script lang="ts">
	import CategoryTable from '$lib/components/categoryTable.svelte';
	import { EVENT_CATEGORY_LIST_UPDATED } from '$lib/event_names';
	import { subscribe, unsubscribe } from '$lib/events';
	import type { Category } from '$lib/types/category';
	import { invoke } from '@tauri-apps/api';
	import dayjs from 'dayjs';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let archivedCategories: Category[] = [];

	async function refreshArchivedCategories() {
		try {
			archivedCategories = await invoke('get_archived_categories_info_command', {
				date: dayjs().format('YYYY-MM-DD')
			});
		} catch (err) {
			toast.error(`error fetching archived categories ${err}`);
		}
	}

	onMount(() => {
		refreshArchivedCategories();
		subscribe(EVENT_CATEGORY_LIST_UPDATED, refreshArchivedCategories);
	});

	onDestroy(() => {
		unsubscribe(EVENT_CATEGORY_LIST_UPDATED, refreshArchivedCategories);
	});
</script>

<main class="flex flex-row flex-1 justify-center">
	<div class="w-4/5 mx-auto my-4 max-w-96">
		<CategoryTable categories={archivedCategories} />
	</div>
</main>
