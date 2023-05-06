<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, DatePicker, DatePickerInput, NumberInput } from 'carbon-components-svelte';

	export let styleColourId: string;
	let length = 1;
	let expected: string;
	let errors: Record<string, string | null> = {
		length: null,
		expected: null
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
			default:
		}
	};

	const handleExpectedChange = (
		e: CustomEvent<
			| string
			| {
					selectedDates: [dateFrom: Date, dateTo?: Date | undefined];
					dateStr: string | { from: string; to: string };
			  }
		>
	) => {
		if (typeof e.detail !== 'string') expected = e.detail.selectedDates[0].toISOString();
	};

	$: setErrors('length', length);

	$: disabled = !(Boolean(length) && Boolean(expected));
</script>

<form method="POST" action="?/addIncoming" use:enhance>
	<input type="hidden" name="id" value={styleColourId} />
	<input type="hidden" name="expected" value={expected} />

	<h4>Add Incoming Fabric</h4>

	<NumberInput
		label="Length"
		bind:value={length}
		placeholder="yards"
		invalid={Boolean(errors.length)}
		invalidText={errors.length ?? undefined}
		name="length"
	/>
	<DatePicker datePickerType="single" on:change={handleExpectedChange}>
		<DatePickerInput
			labelText="Expected"
			placeholder="mm/dd/yyyy"
			invalid={Boolean(errors.expected)}
			invalidText={errors.expected ?? undefined}
			bind:value={expected}
			name="expected"
		/>
	</DatePicker>

	<Button type="submit" kind="secondary" {disabled}>Add Incoming</Button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1vh;
	}
</style>
