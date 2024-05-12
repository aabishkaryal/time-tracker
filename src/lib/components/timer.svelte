<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import icons from '$lib/icon';
	import { toast } from 'svelte-sonner';
	import { invoke } from '@tauri-apps/api/tauri';

	import { categoryStore, currentCategoryStore, currentTimeStore } from '$lib/store';
	import type { Category } from '$lib/types/category';
	import dayjs from 'dayjs';
	import { onDestroy } from 'svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	$: totalTime = dayjs
		.duration(
			$categoryStore.reduce((sum, c) => sum + c.time, 0),
			's'
		)
		.format('HH:mm:ss');
	let currentTime = dayjs.duration(0, 's');

	let frame = window.requestAnimationFrame(updateTime);

	let currentCategory: Category;
	let unsubcribeCurrentCategoryStore = currentCategoryStore.subscribe((category) => {
		if (category) currentCategory = category;
	});

	function onStart() {
		if ($currentTimeStore) {
			toast.error('Stop running timer to start a new one.');
		} else {
			$currentTimeStore = { start: dayjs() };
			currentTime = dayjs.duration(0, 's');
		}
	}

	async function onStop() {
		if (!$currentTimeStore) {
			toast.error('Start timer to stop it.');
			return;
		}
		if (!$currentCategoryStore) {
			toast.error('Category must be selected to add time.');
			return;
		}
		try {
			const timer = {
				categoryName: $currentCategoryStore.name,
				duration: currentTime.asSeconds(),
				startTime: $currentTimeStore.start.unix()
			};
			console.log(timer);
			await invoke('add_timer_command', timer);
			const totalCurrentTime = currentTime
				.add(dayjs.duration($currentCategoryStore!.time, 's'))
				.asSeconds();

			currentCategoryStore.set({
				name: $currentCategoryStore!.name,
				icon: $currentCategoryStore!.icon,
				time: totalCurrentTime
			});
			$currentTimeStore = null;
			currentTime = dayjs.duration(0, 's');
			let categories = $categoryStore.map((c) => Object.assign({}, c));
			const index = categories.findIndex((c) => c.name === $currentCategoryStore?.name);
			if (index === -1) return;
			categories[index] = $currentCategoryStore!;
			categoryStore.set(categories);
		} catch (err) {
			toast.error(`error saving time state, ${err}`);
		}
	}

	function updateTime() {
		if ($currentTimeStore) {
			currentTime = dayjs.duration(dayjs().diff($currentTimeStore.start, 's'), 's');
		}
		frame = window.requestAnimationFrame(updateTime);
	}

	onDestroy(() => {
		window.cancelAnimationFrame(frame);
		unsubcribeCurrentCategoryStore();
	});
</script>

<div class="flex-1 flex flex-col items-center justify-center">
	{#if currentCategory}
		<div class="bg-white shadow-lg rounded-lg p-4 w-full max-w-md">
			<div class="flex flex-row space-x-4 justify-center items-center mb-4">
				<h2 class="text-2xl font-bold">{currentCategory.name}</h2>
				<svelte:component this={icons[currentCategory.icon]} />
			</div>
			<div class="flex items-center justify-center mb-6">
				<span class="text-6xl font-bold">{currentTime.format('HH:mm:ss')}</span>
			</div>
			<div class="flex justify-center">
				<Button variant="link" on:click={onStart}>Start</Button>
				<Button class="ml-4" variant="ghost" on:click={onStop}>Stop</Button>
			</div>
		</div>
	{:else}
		<Skeleton class="min-w-24 min-h-12 w-full max-w-md" />
	{/if}
	<div class="mt-8 w-full max-w-md">
		<h3 class="text-lg font-medium mb-2">Today's Summary</h3>
		<div class="bg-white shadow-lg rounded-lg p-4">
			{#each $categoryStore as c (c.name + c.time)}
				<div class="flex justify-between mb-2">
					<span>{c.name}</span>
					<span>{dayjs.duration(c.time, 's').format('HH:mm:ss')}</span>
				</div>
			{/each}
			<div class="border-t border-gray-200 pt-2 flex justify-between">
				<span class="font-medium">Total</span>
				<span class="font-medium">{totalTime}</span>
			</div>
		</div>
	</div>
</div>
