<script lang="ts">
	import type { Category } from '$lib/types/category';
	import dayjs from 'dayjs';

	export let categories: Category[];

	$: totalTime = dayjs
		.duration(
			categories.reduce((sum, c) => sum + c.time, 0),
			's'
		)
		.format('HH:mm:ss');
</script>

<div class="mt-8 w-full max-w-md">
	<slot name="title" />
	<div class="bg-white shadow-lg rounded-lg p-4">
		{#each categories as c (c.name + c.time)}
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
