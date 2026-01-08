<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Button,
		DatePicker,
		DatePickerInput,
		NumberInput,
		TextInput
	} from 'carbon-components-svelte';
	import { format } from 'date-fns';
	import InlineError from './InlineError.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let name: string = format(new Date(), 'MMMM d yyyy');
	let dateSent: string;
	let dateReceived: string;
	let glenRavenId = 99999;

	let fetching = false;
	let errorMsg: string | null = null;

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

	const handleEnhance: SubmitFunction = () => {
		fetching = true;
		return async ({ update, result }) => {
			if (result.type === 'failure') {
				errorMsg = result.data?.error;
			} else {
				errorMsg = null;
				await update();
			}
			fetching = false;
		};
	};

	$: setErrors('name', name);

	$: disabled = !name || fetching;
</script>

<form method="POST" action="?/addShipment" use:enhance={handleEnhance}>
	<h4>Add Shipment</h4>

	<TextInput
		labelText="Name"
		bind:value={name}
		invalid={Boolean(errors.name)}
		invalidText={errors.name ?? undefined}
		name="name"
	/>

	<DatePicker datePickerType="single" bind:value={dateSent} short={false}>
		<DatePickerInput labelText="Date Sent" placeholder="packing slip print date" name="dateSent" />
	</DatePicker>

	<DatePicker datePickerType="single" bind:value={dateReceived} short={true}>
		<DatePickerInput labelText="Date Received" name="dateReceived" />
	</DatePicker>

	<NumberInput
		labelText="Glen Raven Id"
		bind:value={glenRavenId}
		placeholder="from packing slip"
		name="glenRavenId"
		hideSteppers
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
