<script lang="ts">
	import { Archive } from 'lucide-svelte';
	import TooltipButton from './tooltipButton.svelte';
</script>

<div class="flex flex-row w-full border-b border-b-black pb-2">
	<TooltipButton tooltip="Archive Category">
		<Archive class="h-4 w-4" />
	</TooltipButton>
</div>
