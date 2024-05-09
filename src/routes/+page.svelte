<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div class="h-screen w-screen flex flex-col">
	<header class="bg-gray-900 text-white py-4 px-6">
		<h1 class="text-2xl font-bold">Time Tracker</h1>
	</header>
	<main class="flex flex-row flex-1">
		<nav class="bg-gray-100 w-64 border-r border-gray-200 p-6">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-lg font-semibold">Categories</h2>
				<Button size="sm" variant="outline">+ Add</Button>
			</div>
		</nav>
	</main>
</div>
