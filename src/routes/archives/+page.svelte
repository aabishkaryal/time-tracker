<script lang="ts">
	import ArchiveList from '$lib/components/archiveList.svelte';
	import Header from '$lib/components/header.svelte';
</script>

<div class="h-screen w-screen flex flex-col">
	<Header />
	<main class="flex flex-row flex-1">
		<ArchiveList />
	</main>
</div>
