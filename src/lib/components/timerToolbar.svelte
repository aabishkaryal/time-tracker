<script lang="ts">
	import { EVENT_CATEGORY_LIST_UPDATED, EVENT_CURRENT_CATEGORY_UPDATED } from '$lib/event_names';
	import { publish } from '$lib/events';
	import { currentTimeStore } from '$lib/store';
	import type { Category } from '$lib/types/category';
	import { invoke } from '@tauri-apps/api';
	import dayjs from 'dayjs';
	import { Archive } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import TooltipButton from './tooltipButton.svelte';

	async function archiveCategory() {
		if ($currentTimeStore) {
			toast.error('Stop running timer to archive category.');
			return;
		}
		try {
			let categories: Category[] = await invoke('get_active_categories_info_command', {
				date: dayjs().format('YYYY-MM-DD')
			});
			if (categories.length === 1) {
				toast.error('Cannot archive last category.');
				return;
			}
			let currentCategory: Category = await invoke('get_current_category_command', {
				date: dayjs().format('YYYY-MM-DD')
			});
			await invoke('archive_category_command', { name: currentCategory.name });
			publish(EVENT_CATEGORY_LIST_UPDATED);
			publish(EVENT_CURRENT_CATEGORY_UPDATED);
		} catch (err) {
			toast.error(`error archiving category, ${err}`);
		}
	}
</script>

<div class="flex flex-row w-full border-b border-b-black pb-2">
	<TooltipButton tooltip="Archive Category" onClick={archiveCategory}>
		<Archive class="h-4 w-4" />
	</TooltipButton>
</div>
