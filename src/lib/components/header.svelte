<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { currentTimeStore } from '$lib/store';
	import { toast } from 'svelte-sonner';

	async function goToArchives() {
		if (window.location.pathname === '/archives') return;

		if ($currentTimeStore !== null) {
			toast.error('Stop current timer to view archives');
			return;
		}
		window.location.href = '/archives';
	}

	async function goToHome() {
		if (window.location.pathname === '/') return;
		window.location.href = '/';
	}

	async function goToHistory() {
		if (window.location.pathname === '/history') return;
		window.location.href = '/history';
	}
</script>

<header class="bg-gray-900 text-white py-4 px-6 flex flex-row justify-between">
	<h1 class="text-2xl font-bold">Time Tracker</h1>
	<div class="flex flex-row">
		<Button variant="link" class="text-white" on:click={goToHome}>Home</Button>
		<Button variant="link" class="text-white" on:click={goToArchives}>Archives</Button>
		<Button variant="link" class="text-white" on:click={goToHistory}>History</Button>
	</div>
</header>
