<script lang="ts">
	import { Button, type Variant } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	export let tooltip: string;
	export let onClick: undefined | ((e: MouseEvent) => void) = undefined;
	export let variant: Variant = 'outline';
	export let disabled: boolean = false;
</script>

<Button {variant} on:click={onClick} {disabled}>
	<Tooltip.Root>
		<Tooltip.Trigger><slot /></Tooltip.Trigger>
		<Tooltip.Content>
			<p>{tooltip}</p>
		</Tooltip.Content>
	</Tooltip.Root></Button>
