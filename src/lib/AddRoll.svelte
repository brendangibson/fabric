<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, NumberInput, Select, SelectItem, TextInput } from 'carbon-components-svelte';
	import type { TShipment } from '../fabric';
	import InlineError from './InlineError.svelte';
	import { invalidateAll } from '$app/navigation';

	export let styleColourId: string;
	export let shipments: TShipment[];
	let length = 1;
	let glenRavenId = 999999;
	let shipmentId = shipments[0].id;
	let notes = '';

	let fetching = false;
	let errorMsg: string | null = null;

	let errors: Record<string, string | null> = {
		length: null
	};

	const setErrors = (index: string, value: number) => {
		switch (index) {
			case 'length':
				if (value === undefined || value === null) return;
				if (isNaN(value)) {
					errors[index] = 'Enter the number of yards';
				} else {
					if (value <= 0) {
						errors[index] = 'Too short';
					} else {
						errors[index] = null;
					}
				}
				break;
			case 'glenRavenId':
				if (value < 9999) {
					errors[index] = 'Should be more digits';
				} else {
					errors[index] = null;
				}
				break;
			default:
		}
	};

	$: setErrors('length', length);
	$: setErrors('glenRavenId', glenRavenId);

	$: disabled = !(Boolean(length) && Boolean(glenRavenId) && Boolean(shipmentId)) || fetching;
</script>

<form
	method="POST"
	action="?/addRoll"
	use:enhance={() => {
		fetching = true;
		return async ({ update, result }) => {
			if (result.type === 'failure') {
				errorMsg = result.data?.error;
			} else {
				errorMsg = null;
				await update();
				await invalidateAll();
			}
			fetching = false;
		};
	}}
>
	<input type="hidden" name="id" value={styleColourId} />

	<h4>Add Roll</h4>

	<NumberInput
		label="Length"
		bind:value={length}
		placeholder="yards"
		invalid={Boolean(errors.length)}
		invalidText={errors.length ?? undefined}
		name="length"
	/>

	<NumberInput
		label="GlenRaven Id"
		bind:value={glenRavenId}
		placeholder="From sticker on bag"
		invalid={Boolean(errors.glenRavenId)}
		invalidText={errors.glenRavenId ?? undefined}
		name="glenRavenId"
	/>

	{#if shipments}
		<Select labelText="Shipment" bind:selected={shipmentId} name="shipment">
			{#each shipments as shipment}
				<SelectItem value={shipment.id} text={shipment.name} />
			{/each}
		</Select>
	{/if}

	<TextInput
		labelText="Notes"
		bind:value={notes}
		invalid={Boolean(errors.notes)}
		invalidText={errors.notes ?? undefined}
		name="notes"
	/>

	<Button type="submit" kind="secondary" {disabled}>Add</Button>
	<InlineError {errorMsg} />
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1vh;
	}
</style>
