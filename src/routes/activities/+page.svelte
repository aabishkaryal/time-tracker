<script lang="ts">
	import ActivitiesTable from '$lib/components/activitiesTable.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { EVENT_CATEGORY_LIST_UPDATED } from '$lib/event_names';
	import { subscribe, unsubscribe } from '$lib/events';
	import type { Category } from '$lib/types/category';
	import { invoke } from '@tauri-apps/api';
	import dayjs from 'dayjs';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let activeCategories: Category[] = [];
	let archivedCategories: Category[] = [];
	let loading = true;

	async function refreshActiveCategories() {
		try {
			activeCategories = await invoke('get_active_categories_info_command', {
				date: dayjs().format('YYYY-MM-DD')
			});
		} catch (err) {
			toast.error(`error fetching active categories ${err}`);
		}
	}

	async function refreshArchivedCategories() {
		try {
			archivedCategories = await invoke('get_archived_categories_info_command', {
				date: dayjs().format('YYYY-MM-DD')
			});
		} catch (err) {
			toast.error(`error fetching archived categories ${err}`);
		}
	}

	async function refreshAllCategories() {
		loading = true;
		await Promise.all([refreshActiveCategories(), refreshArchivedCategories()]);
		loading = false;
	}

	onMount(() => {
		refreshAllCategories();
		subscribe(EVENT_CATEGORY_LIST_UPDATED, refreshAllCategories);
	});

	onDestroy(() => {
		unsubscribe(EVENT_CATEGORY_LIST_UPDATED, refreshAllCategories);
	});
</script>

<svelte:head>
	<title>Activities - Time Tracker</title>
</svelte:head>

<main class="flex flex-row flex-1 justify-center">
	<div class="w-full max-w-4xl mx-auto my-6 px-4">
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Activities Management</h1>
			<p class="text-gray-600">Manage your active and archived categories</p>
		</div>

		{#if loading}
			<div class="flex justify-center py-12">
				<div class="text-gray-500">Loading categories...</div>
			</div>
		{:else}
			<Tabs.Root value="active" class="w-full">
				<Tabs.List class="grid w-full grid-cols-2 mb-6">
					<Tabs.Trigger value="active" class="flex items-center gap-2">
						<span class="font-medium">Active Categories</span>
						<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
							{activeCategories.length}
						</span>
					</Tabs.Trigger>
					<Tabs.Trigger value="archived" class="flex items-center gap-2">
						<span class="font-medium">Archived Categories</span>
						<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
							{archivedCategories.length}
						</span>
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="active" class="space-y-4">
					<div class="bg-white rounded-lg border border-gray-200 p-6">
						<div class="mb-4">
							<h2 class="text-lg font-semibold text-gray-900 mb-2">Active Categories</h2>
							<p class="text-sm text-gray-600">
								These are your currently active categories. You can archive or delete them.
							</p>
						</div>
						<ActivitiesTable categories={activeCategories} type="active" activeCategoryCount={activeCategories.length} />
					</div>
				</Tabs.Content>

				<Tabs.Content value="archived" class="space-y-4">
					<div class="bg-white rounded-lg border border-gray-200 p-6">
						<div class="mb-4">
							<h2 class="text-lg font-semibold text-gray-900 mb-2">Archived Categories</h2>
							<p class="text-sm text-gray-600">
								These categories have been archived. You can restore them or permanently delete them.
							</p>
						</div>
						<ActivitiesTable categories={archivedCategories} type="archived" activeCategoryCount={activeCategories.length} />
					</div>
				</Tabs.Content>
			</Tabs.Root>
		{/if}
	</div>
</main>