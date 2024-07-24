<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import '$lib/css/app.css';
	import { ModeWatcher, setMode } from 'mode-watcher';

	setMode('light');
</script>

<ModeWatcher />
<slot />
<Toaster position="top-right" duration={1000} />
