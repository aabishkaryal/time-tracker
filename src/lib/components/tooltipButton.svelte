<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	export let tooltip: string;
	export let onClick: undefined | ((e: MouseEvent) => void) = undefined;
</script>

<Button variant="outline" on:click={onClick}>
	<Tooltip.Root>
		<Tooltip.Trigger><slot /></Tooltip.Trigger>
		<Tooltip.Content>
			<p>{tooltip}</p>
		</Tooltip.Content>
	</Tooltip.Root></Button>
