<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Category } from '$lib/types/category';
	import IconSelector from '$lib/components/iconSelector.svelte';

	const categories: Category[] = [{ name: 'Work', icon: 'briefcase' }];
	let categoryName = '';
	let categoryIcon = '';

	async function createCategory() {}
</script>

<nav class="bg-gray-100 w-64 border-r border-gray-200 p-6">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-lg font-semibold">Categories</h2>
		<Dialog.Root>
			<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
				+ Add
			</Dialog.Trigger>
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
					<Button type="submit" on:click={createCategory}>Save changes</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>
	<Separator decorative />
	<div class="space-y-4 flex items-center justify-between">
		{#each categories as c}
			<div class="flex items-center gap-3">
				<span class="font-medium">{c.name}</span>
			</div>
		{/each}
	</div>
</nav>
