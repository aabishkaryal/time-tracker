<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { categoryStore, currentCategoryStore, currentTimeStore } from '$lib/store';
	import dayjs from 'dayjs';

	let totalTime = '00:00:00';

	function onStart() {
		if ($currentTimeStore) return;
		$currentTimeStore = { start: dayjs() };
	}
  
	function onStop() {
		if (!$currentTimeStore) return;
		console.log(dayjs.duration(dayjs().diff($currentTimeStore.start)).format('HH:mm:ss'));
		$currentTimeStore = null;
	}
</script>

<div class="flex-1 flex flex-col items-center justify-center">
	<div class="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md">
		<h2 class="text-2xl font-bold mb-4">{$currentCategoryStore?.name}</h2>
		<div class="flex items-center justify-center mb-6">
			<span class="text-6xl font-bold">{$currentCategoryStore?.time}</span>
		</div>
		<div class="flex justify-center">
			<Button variant="link" on:click={onStart}>Start</Button>
			<Button class="ml-4" variant="ghost" on:click={onStop}>Stop</Button>
		</div>
	</div>
	<div class="mt-8 w-full max-w-md">
		<h3 class="text-lg font-medium mb-2">Today's Summary</h3>
		<div class="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4">
			{#each $categoryStore as c (c.name)}
				<div class="flex justify-between mb-2">
					<span>{c.name}</span>
					<span>{c.time}</span>
				</div>
			{/each}
			<div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
				<span class="font-medium">Total</span>
				<span class="font-medium">{totalTime}</span>
			</div>
		</div>
	</div>
</div>
