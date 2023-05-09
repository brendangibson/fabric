<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Button,
		DatePicker,
		DatePickerInput,
		NumberInput,
		TextInput
	} from 'carbon-components-svelte';

	let name: string;
	let dateSent: string;
	let dateReceived: string;
	let glenRavenId: number;

	let fetching = false;

	let errors: Record<string, string | null> = {
		length: null
	};

	const setErrors = (index: string, value: string) => {
		switch (index) {
			case 'name':
				if (value === '') {
					errors[index] = 'Enter a memorable name';
				} else {
					errors[index] = null;
				}
				break;
			default:
		}
	};

	$: setErrors('name', name);

	$: disabled = !name || fetching;
</script>

<form
	method="POST"
	action="?/addShipment"
	use:enhance={() => {
		fetching = true;
		return async ({ update }) => {
			await update();
			fetching = false;
		};
	}}
>
	<h4>Add Shipment</h4>

	<TextInput
		labelText="Name"
		bind:value={name}
		invalid={Boolean(errors.name)}
		invalidText={errors.name ?? undefined}
		name="name"
	/>

	<DatePicker datePickerType="single" bind:value={dateSent}>
		<DatePickerInput
			labelText="Date Sent"
			placeholder="print date from packing slip"
			name="dateSent"
		/>
	</DatePicker>

	<DatePicker datePickerType="single" bind:value={dateReceived}>
		<DatePickerInput labelText="Date Received" name="dateReceived" />
	</DatePicker>

	<NumberInput
		label="Glen Raven Id"
		bind:value={glenRavenId}
		placeholder="from packing slip"
		name="glenRavenId"
	/>

	<Button type="submit" kind="secondary" {disabled}>Add</Button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1vh;
	}
</style>
