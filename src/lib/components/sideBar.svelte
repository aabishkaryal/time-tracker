<script lang="ts">
	import IconSelector from '$lib/components/iconSelector.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import icons from '$lib/icon';
	import { categoryStore, currentCategoryStore, currentTimeStore } from '$lib/store';
	import type { Category } from '$lib/types/category';
	import { invoke } from '@tauri-apps/api/tauri';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';

	let categoryName = '';
	let categoryIcon = '';

	let dialogOpen = false;

	async function createCategory() {
		if (!categoryName) {
			toast.error('Category Name is required.');
			return;
		}
		if (!categoryIcon) {
			toast.error('Category Icon is required.');
			return;
		}
		if ($categoryStore.find((c) => c.name === categoryName)) {
			toast.error(`Category with name "${categoryName}" already exists`);
			return;
		}
		try {
			const currentCategories = get(categoryStore);
			const newCategory: Category = { name: categoryName, icon: categoryIcon, time: 0 };
			await invoke('add_category_command', newCategory);
			categoryStore.set([...currentCategories, newCategory]);
			toast.success(`Successfully created new category "${categoryName}"`);
			categoryIcon = '';
			categoryName = '';
			toggleDialog();
		} catch (err) {
			toast.error(`error creating new category, ${err}`);
		}
	}

	function toggleDialog() {
		dialogOpen = !dialogOpen;
	}

	function changeCategory(c: Category) {
		if ($currentTimeStore !== null) {
			toast.error('Stop current timer to switch categories');
			return;
		}
		currentCategoryStore.set(c);
	}
</script>

<nav class="bg-gray-100 w-48 border-r border-gray-200 p-6">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-lg font-semibold">Categories</h2>
		<Dialog.Root bind:open={dialogOpen} onOpenChange={toggleDialog} onOutsideClick={toggleDialog}>
			<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>+</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-[425px]">
				<Dialog.Header>
					<Dialog.Title>Add Category</Dialog.Title>
					<Dialog.Description>
						Add new category to track your time. Click confirm when you're done
					</Dialog.Description>
				</Dialog.Header>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="name" class="text-right">Name</Label>
						<Input id="name" class="col-span-3" bind:value={categoryName} required />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="icon" class="text-right">Icon</Label>
						<IconSelector bind:icon={categoryIcon} />
					</div>
				</div>
				<Dialog.Footer>
					<Button type="submit" on:click={createCategory} disabled={!categoryName || !categoryIcon}>
						Save changes
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>
	<ScrollArea>
		<div
			class="space-y-4 flex flex-col items-center justify-between border-t border-b border-gray-300 py-4">
			{#each $categoryStore as c (c.name + c.icon)}
				<Button
					variant="link"
					class="flex flex-row justify-between w-full"
					on:click={() => changeCategory(c)}>
					<svelte:component this={icons[c.icon]} />
					<span class="font-medium">{c.name}</span>
				</Button>
			{/each}
		</div>
	</ScrollArea>
</nav>
