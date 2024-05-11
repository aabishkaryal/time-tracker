<script lang="ts">
	import '$lib/css/app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { setMode } from 'mode-watcher';

	setMode('light');
</script>

<ModeWatcher />
<slot />
<Toaster position="top-right" duration={1000} dismissible />
