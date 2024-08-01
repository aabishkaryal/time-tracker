<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import '$lib/css/app.css';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import { ModeWatcher, setMode } from 'mode-watcher';

	dayjs.extend(duration);
</script>

<ModeWatcher />
<div class="h-screen w-screen flex flex-col">
	<Header />
	<slot />
</div>
<Toaster position="top-right" duration={1000} />
