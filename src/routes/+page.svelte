<script lang="ts">
	import SideBar from '$lib/components/sideBar.svelte';
	import Timer from '$lib/components/timer.svelte';
	import { categoryStore, currentCategoryStore } from '$lib/store';

	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	dayjs.extend(duration);

	let categories = [{ name: 'Work', icon: 'briefcase', time: 0 }];
	categoryStore.set(categories);
	currentCategoryStore.set(categories[0]);
</script>

<div class="h-screen w-screen flex flex-col">
	<header class="bg-gray-900 text-white py-4 px-6">
		<h1 class="text-2xl font-bold">Time Tracker</h1>
	</header>
	<main class="flex flex-row flex-1">
		<SideBar />
		<Timer />
	</main>
</div>
