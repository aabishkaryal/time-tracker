<script lang="ts">
	import SideBar from '$lib/components/sideBar.svelte';
</script>

<div class="h-screen w-screen flex flex-col">
	<header class="bg-gray-900 text-white py-4 px-6">
		<h1 class="text-2xl font-bold">Time Tracker</h1>
	</header>
	<main class="flex flex-row flex-1">
		<SideBar />
	</main>
</div>
