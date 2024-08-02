<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { EVENT_CATEGORY_LIST_UPDATED } from '$lib/event_names';
	import { publish, subscribe, unsubscribe } from '$lib/events';
	import type { Category } from '$lib/types/category';
	import { invoke } from '@tauri-apps/api';
	import dayjs from 'dayjs';
	import { ShieldPlus } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import TooltipButton from './tooltipButton.svelte';

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

	async function restoreCategory(uuid: string) {
		try {
			await invoke('restore_category_command', { uuid });
			publish(EVENT_CATEGORY_LIST_UPDATED);
		} catch (err) {
			toast.error(`error restoring category ${err}`);
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

<div class="contents">
	<Table.Root class="border border-gray-200">
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">S.No.</Table.Head>
				<Table.Head>Name</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each archivedCategories as category, index (category.uuid)}
				<Table.Row>
					<Table.Cell>{index + 1}</Table.Cell>
					<Table.Cell>{category.name}</Table.Cell>
					<Table.Cell class="text-right">
						<TooltipButton
							tooltip="Restore Category"
							variant="secondary"
							onClick={() => restoreCategory(category.uuid)}>
							<ShieldPlus class="h-4 w-4" />
						</TooltipButton>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
