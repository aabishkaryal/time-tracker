<script lang="js">
	import icons from '$lib/icon';
	import * as Select from '$lib/components/ui/select';

	export let icon = '';
</script>

<Select.Root
	portal={null}
	preventScroll={false}
	onSelectedChange={(v) => {
		if (v?.value && typeof v.value == 'string' && Object.keys(icons).includes(v.value))
			icon = v.value;
	}}
	scrollAlignment="center"
	typeahead={true}
	required={true}>
	<Select.Trigger class="w-48">
		<Select.Value placeholder="Select an icon" />
	</Select.Trigger>
	<Select.Content>
		<Select.Label>Icons</Select.Label>
		{#each Object.keys(icons) as name (name)}
			<Select.Item label={name} value={name}>
				<div class="flex flex-row space-x-4">
					<svelte:component this={icons[name]} />
					<p>{name}</p>
				</div>
			</Select.Item>
		{/each}
	</Select.Content>
	<Select.Input name="icon-select" />
</Select.Root>
