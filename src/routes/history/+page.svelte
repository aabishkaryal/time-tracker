<script lang="ts">
	import Calendar from '$lib/components/Calendar.svelte';
	import TimerSummary from '$lib/components/timerSummary.svelte';
	import { type Category } from '$lib/types/category';
	import { type DateValue, today, getLocalTimeZone } from '@internationalized/date';
	import { invoke } from '@tauri-apps/api';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let categories: Category[] = [];

	let selectedDateString: string;
	let selectedDate: DateValue = today(getLocalTimeZone());

	async function refresh(selectedDate: DateValue | undefined) {
		if (!selectedDate) return;
		selectedDateString = selectedDate.toString();
		try {
			categories = await invoke('get_all_categories_info_command', {
				date: selectedDateString
			});
		} catch (err) {
			toast.error(`error fetching categories ${err}`);
		}
	}

	onMount(() => {
		// Load current date data on mount
		refresh(selectedDate);
	});
</script>

<main class="flex flex-row flex-1 justify-center">
	<div class="w-4/5 mx-auto my-4 max-w-96">
		<Calendar class="flex flex-col items-center" onValueChange={refresh} unselectable="off" bind:value={selectedDate} />
		{#if selectedDateString}
			<TimerSummary {categories}>
				<h3 slot="title" class="text-lg font-medium mb-2">{selectedDateString} Summary</h3>
			</TimerSummary>
		{:else}
			<h3 class="text-lg font-medium mb-2 mt-8 w-full max-w-md text-center">
				Select a date to view summary
			</h3>
		{/if}
	</div>
</main>
