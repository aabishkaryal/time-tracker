<script lang="ts">
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Table from '$lib/components/ui/table';
	import { EVENT_CATEGORY_LIST_UPDATED } from '$lib/event_names';
	import { publish, subscribe, unsubscribe } from '$lib/events';
	import type { Category } from '$lib/types/category';
	import { invoke } from '@tauri-apps/api';
	import dayjs from 'dayjs';
	import { ShieldPlus } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';
	import TooltipButton from './tooltipButton.svelte';
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

	async function restoreCategory(name: string) {
		try {
			await invoke('restore_category_command', { name });
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
			{#each archivedCategories as category, index}
				<Table.Row>
					<Table.Cell>{index + 1}</Table.Cell>
					<Table.Cell>{category.name}</Table.Cell>
					<Table.Cell class="text-right">
						<TooltipButton
							tooltip="Restore Category"
							variant="secondary"
							onClick={() => restoreCategory(category.name)}>
							<ShieldPlus class="h-4 w-4" />
						</TooltipButton>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	{#if archivedCategories.length > 10}
		<Pagination.Root count={archivedCategories.length} perPage={10} let:pages let:currentPage>
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton />
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item hidden={currentPage == page.value}>
							<Pagination.Link {page} isActive={currentPage == page.value}>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton />
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	{/if}
</div>
