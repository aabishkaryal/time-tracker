<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	export let tooltip: string;
</script>

<Button variant="outline">
	<Tooltip.Root>
		<Tooltip.Trigger><slot /></Tooltip.Trigger>
		<Tooltip.Content>
			<p>{tooltip}</p>
		</Tooltip.Content>
	</Tooltip.Root></Button>
