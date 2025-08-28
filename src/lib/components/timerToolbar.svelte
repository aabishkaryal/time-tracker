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
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	let confirmDialogOpen = false;
	let currentCategory: Category | null = null;

	async function showArchiveConfirm() {
		if ($currentTimeStore) {
			toast.error('Stop running timer to archive category.');
			return;
		}
		
		try {
			// Get current category and check if we can archive it
			currentCategory = await invoke('get_current_category_command');
			
			let categories: Category[] = await invoke('get_active_categories_info_command', {
				date: dayjs().format('YYYY-MM-DD')
			});
			
			if (categories.length === 1) {
				toast.error('Cannot archive the last active category. You must have at least one category available for time tracking.');
				return;
			}
			
			confirmDialogOpen = true;
		} catch (err) {
			toast.error(`error getting category info, ${err}`);
		}
	}

	async function archiveCategory() {
		if (!currentCategory) return;
		
		try {
			await invoke('archive_category_command', { uuid: currentCategory.uuid });
			
			// Switch to another random category
			await switchToRandomCategory();
			
			publish(EVENT_CATEGORY_LIST_UPDATED);
			toast.success(`Successfully archived category "${currentCategory.name}"`);
			closeConfirmDialog();
		} catch (err) {
			toast.error(`error archiving category, ${err}`);
		}
	}

	async function switchToRandomCategory() {
		try {
			// Get fresh list of active categories
			const activeCategories: Category[] = await invoke('get_active_categories_info_command', {
				date: dayjs().format('YYYY-MM-DD')
			});
			
			// Filter out the category we're about to archive
			const availableCategories = activeCategories.filter(cat => 
				!cat.archived && 
				cat.uuid !== currentCategory?.uuid
			);
			
			if (availableCategories.length > 0) {
				// Pick a random category from available ones
				const randomIndex = Math.floor(Math.random() * availableCategories.length);
				const newCurrentCategory = availableCategories[randomIndex];
				
				await invoke('update_current_category_command', { uuid: newCurrentCategory.uuid });
				publish(EVENT_CURRENT_CATEGORY_UPDATED);
				toast.success(`Switched to "${newCurrentCategory.name}" category`);
			}
		} catch (err) {
			console.error('Error switching category:', err);
		}
	}

	function closeConfirmDialog() {
		confirmDialogOpen = false;
		currentCategory = null;
	}
</script>

<div class="flex flex-row w-full border-b border-b-black pb-2">
	<TooltipButton tooltip="Archive Category" onClick={showArchiveConfirm}>
		<Archive class="h-4 w-4" />
	</TooltipButton>
</div>

<!-- Archive Confirmation Dialog -->
<Dialog.Root bind:open={confirmDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Archive Category</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to archive "{currentCategory?.name}"? You can restore it later from the archived tab, and you'll be automatically switched to another category.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex gap-2">
			<Button variant="outline" on:click={closeConfirmDialog}>
				Cancel
			</Button>
			<Button on:click={archiveCategory}>
				Archive
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
