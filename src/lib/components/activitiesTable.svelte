<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import { EVENT_CATEGORY_LIST_UPDATED } from '$lib/event_names';
	import { publish } from '$lib/events';
	import icons from '$lib/icon';
	import type { Category } from '$lib/types/category';
	import { invoke } from '@tauri-apps/api';
	import { Archive, Edit, ShieldPlus, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import TooltipButton from './tooltipButton.svelte';

	export let categories: Category[];
	export let type: 'active' | 'archived' = 'active';

	// Dialog states
	let editDialogOpen = false;
	let editingCategory: Category | null = null;
	let editName = '';
	let editTarget = 0;

	async function archiveCategory(uuid: string, categoryName: string) {
		if (confirm(`Are you sure you want to archive "${categoryName}"?`)) {
			try {
				await invoke('archive_category_command', { uuid });
				publish(EVENT_CATEGORY_LIST_UPDATED);
				toast.success(`Successfully archived category "${categoryName}"`);
			} catch (err) {
				toast.error(`error archiving category ${err}`);
			}
		}
	}

	async function restoreCategory(uuid: string, categoryName: string) {
		try {
			await invoke('restore_category_command', { uuid });
			publish(EVENT_CATEGORY_LIST_UPDATED);
			toast.success(`Successfully restored category "${categoryName}"`);
		} catch (err) {
			toast.error(`error restoring category ${err}`);
		}
	}

	async function deleteCategory(uuid: string, categoryName: string) {
		if (
			confirm(
				`Are you sure you want to permanently delete "${categoryName}"? This will also delete all associated time tracking data.`
			)
		) {
			try {
				await invoke('delete_category_command', { uuid });
				publish(EVENT_CATEGORY_LIST_UPDATED);
				toast.success(`Successfully deleted category "${categoryName}"`);
			} catch (err) {
				toast.error(`error deleting category ${err}`);
			}
		}
	}

	function openEditDialog(category: Category) {
		editingCategory = category;
		editName = category.name;
		editTarget = category.daily_target / 3600; // Convert seconds to hours
		editDialogOpen = true;
	}

	async function saveChanges() {
		if (!editingCategory || !editName.trim()) return;

		if (editName.length < 3 || editName.length > 20) {
			toast.error('Category name must be between 3 and 20 characters');
			return;
		}

		if (editTarget < 0 || editTarget > 24) {
			toast.error('Target must be between 0 and 24 hours');
			return;
		}

		try {
			// Update both name and target
			await invoke('update_category_name_command', {
				uuid: editingCategory.uuid,
				newName: editName.trim()
			});

			const targetInSeconds = editTarget * 3600; // Convert hours to seconds
			await invoke('update_category_target_command', {
				uuid: editingCategory.uuid,
				dailyTarget: targetInSeconds
			});

			publish(EVENT_CATEGORY_LIST_UPDATED);
			toast.success(`Successfully updated "${editName}" with ${editTarget}h daily target`);
			closeEditDialog();
		} catch (err) {
			toast.error(`Error updating category: ${err}`);
		}
	}

	function closeEditDialog() {
		editDialogOpen = false;
		editingCategory = null;
		editName = '';
		editTarget = 0;
	}

	function formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	}

	function getProgressPercentage(time: number, target: number): number {
		if (target === 0) return 0;
		return Math.min((time / target) * 100, 100);
	}
</script>

<div class="w-full">
	{#if categories.length === 0}
		<div class="text-center py-8 text-gray-500">
			{#if type === 'active'}
				No active categories found. Create a new category to get started.
			{:else}
				No archived categories found.
			{/if}
		</div>
	{:else}
		<Table.Root class="border border-gray-200">
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[80px]">S.No.</Table.Head>
					<Table.Head>Category</Table.Head>
					<Table.Head class="w-[140px]">
						<div class="flex items-center gap-1">
							Today's Time
							<TooltipButton
								tooltip="Time spent on this category today"
								variant="ghost"
								onClick={() => {}}>
								<span class="text-gray-400 text-xs">ℹ</span>
							</TooltipButton>
						</div>
					</Table.Head>
					{#if type === 'active'}
						<Table.Head class="w-[140px]">Daily Target</Table.Head>
						<Table.Head class="w-[120px]">Progress</Table.Head>
					{/if}
					<Table.Head class="text-right w-[200px]">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each categories as category, index (category.uuid)}
					<Table.Row>
						<Table.Cell class="font-medium">{index + 1}</Table.Cell>
						<Table.Cell class="font-medium">
							<div class="flex items-center gap-2">
								<svelte:component this={icons[category.icon]} />
								{category.name}
							</div>
						</Table.Cell>
						<Table.Cell class="font-medium text-blue-600">
							{formatTime(category.time)}
						</Table.Cell>
						{#if type === 'active'}
							<Table.Cell>
								{#if category.daily_target > 0}
									{formatTime(category.daily_target)}
								{:else}
									<span class="text-gray-400">No target</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								{#if category.daily_target > 0}
									<div class="flex items-center gap-2">
										<div class="flex-1 bg-gray-200 rounded-full h-2">
											<div
												class="bg-blue-600 h-2 rounded-full transition-all duration-300"
												style="width: {getProgressPercentage(
													category.time,
													category.daily_target
												)}%">
											</div>
										</div>
										<span class="text-xs text-gray-600">
											{Math.round(getProgressPercentage(category.time, category.daily_target))}%
										</span>
									</div>
								{:else}
									<span class="text-gray-400 text-sm">—</span>
								{/if}
							</Table.Cell>
						{/if}
						<Table.Cell class="text-right">
							<div class="flex gap-1 justify-end">
								{#if type === 'active'}
									<TooltipButton
										tooltip="Edit Category"
										variant="ghost"
										onClick={() => openEditDialog(category)}>
										<Edit class="h-4 w-4" />
									</TooltipButton>
									<TooltipButton
										tooltip="Archive Category"
										variant="secondary"
										onClick={() => archiveCategory(category.uuid, category.name)}>
										<Archive class="h-4 w-4" />
									</TooltipButton>
								{:else}
									<TooltipButton
										tooltip="Restore Category"
										variant="secondary"
										onClick={() => restoreCategory(category.uuid, category.name)}>
										<ShieldPlus class="h-4 w-4" />
									</TooltipButton>
								{/if}
								<TooltipButton
									tooltip="Delete Category"
									variant="destructive"
									onClick={() => deleteCategory(category.uuid, category.name)}>
									<Trash2 class="h-4 w-4" />
								</TooltipButton>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
</div>

<!-- Edit Category Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Edit Category</Dialog.Title>
			<Dialog.Description>
				Update the name and daily target for "{editingCategory?.name}".
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-6 py-4">
			<div class="flex items-center gap-4">
				<Label for="edit-name" class="w-32 text-right">Name</Label>
				<Input
					id="edit-name"
					class="flex-1"
					bind:value={editName}
					placeholder="Enter category name"
					maxlength={20} />
			</div>
			<div class="flex items-center gap-4">
				<Label for="edit-target" class="w-32 text-right pt-2">Daily Target (hrs)</Label>
				<Input
					id="edit-target"
					type="number"
					min="0"
					max="24"
					step="0.5"
					bind:value={editTarget}
					placeholder="2.5" />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" on:click={closeEditDialog}>Cancel</Button>
			<Button
				on:click={saveChanges}
				disabled={!editName.trim() ||
					editName.length < 3 ||
					editName.length > 20 ||
					editTarget < 0 ||
					editTarget > 24}>
				Save Changes
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
