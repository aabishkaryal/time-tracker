<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import icons from '$lib/icon';
	import { invoke } from '@tauri-apps/api/tauri';
	import { toast } from 'svelte-sonner';

	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { EVENT_CATEGORY_LIST_UPDATED, EVENT_CURRENT_CATEGORY_UPDATED } from '$lib/event_names';
	import { publish, subscribe, unsubscribe } from '$lib/events';
	import { currentTimeStore } from '$lib/store';
	import type { Category } from '$lib/types/category';
	import dayjs from 'dayjs';
	import { onDestroy, onMount } from 'svelte';
	import TimerSummary from './timerSummary.svelte';
	import TimerToolbar from './timerToolbar.svelte';

	let currentTime = dayjs.duration(0, 's');

	let frame = window.requestAnimationFrame(updateTime);

	let currentCategory: Category;

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
		if (!currentCategory) {
			toast.error('Category must be selected to add time.');
			return;
		}
		try {
			const timer = {
				categoryName: currentCategory.name,
				duration: currentTime.asSeconds(),
				startTime: $currentTimeStore.start.unix()
			};
			await invoke('add_timer_command', timer);
			publish(EVENT_CATEGORY_LIST_UPDATED);
			publish(EVENT_CURRENT_CATEGORY_UPDATED);
			currentTimeStore.set(null);
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

	async function refreshCurrentCategory() {
		currentCategory = await invoke('get_current_category_command');
	}

	onMount(() => {
		refreshCurrentCategory();
		subscribe(EVENT_CURRENT_CATEGORY_UPDATED, refreshCurrentCategory);
	});

	onDestroy(() => {
		window.cancelAnimationFrame(frame);
		unsubscribe(EVENT_CURRENT_CATEGORY_UPDATED, refreshCurrentCategory);
	});
</script>

<div class="flex-1 flex flex-col items-center justify-center my-6">
	{#if currentCategory}
		<div class="bg-white shadow-lg rounded-lg p-4 w-full max-w-md">
			<TimerToolbar />
			<div class="flex flex-row space-x-4 justify-center items-center my-4">
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
		<Skeleton class="min-w-24 min-h-24 w-full max-w-md" />
	{/if}
	<TimerSummary />
</div>
