<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { EVENT_CATEGORY_LIST_UPDATED } from '$lib/event_names';
	import { publish } from '$lib/events';
	import type { Category } from '$lib/types/category';
	import { invoke } from '@tauri-apps/api';
	import { ShieldPlus } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import TooltipButton from './tooltipButton.svelte';

	export let categories: Category[];

	async function restoreCategory(uuid: string) {
		try {
			await invoke('restore_category_command', { uuid });
			publish(EVENT_CATEGORY_LIST_UPDATED);
		} catch (err) {
			toast.error(`error restoring category ${err}`);
		}
	}
</script>

<Table.Root class="border border-gray-200">
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-[100px]">S.No.</Table.Head>
			<Table.Head>Name</Table.Head>
			<Table.Head class="text-right">Actions</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each categories as category, index (category.uuid)}
			<Table.Row>
				<Table.Cell>{index + 1}</Table.Cell>
				<Table.Cell>{category.name}</Table.Cell>
				<Table.Cell class="text-right">
					<TooltipButton
						tooltip="Restore Category"
						variant="secondary"
						disabled={!category.archived}
						onClick={() => restoreCategory(category.uuid)}>
						<ShieldPlus class="h-4 w-4" />
					</TooltipButton>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
