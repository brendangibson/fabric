<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, NumberInput, Select, SelectItem, TextInput } from 'carbon-components-svelte';
	import { reasons } from '../dataFunctions/cuts';

	export let rollId: string;
	export let remaining: number;

	let yards = 1;
	let inches = 0;
	let reason = 'otherOrder';
	let notes = '';

	let fetching = false;

	let errors: Record<string, string | null> = {
		length: null
	};

	const setErrors = (index: string, value: number) => {
		switch (index) {
			case 'length':
				if (isNaN(value)) {
					errors[index] = 'Enter the number of yards';
				} else {
					if (value <= 0) {
						errors[index] = 'Too short';
					} else {
						if (value > 100 || value > remaining + 0.1) {
							errors[index] = 'Too long';
						} else {
							errors[index] = null;
						}
					}
				}
				break;
			default:
		}
	};

	const handleReasonChange = (e: Event) => (reason = (e.target as HTMLInputElement)?.value);

	$: length = yards + inches / 36;

	$: setErrors('length', length);

	$: disabled = !(length + inches) || fetching;
</script>

<form
	method="POST"
	action="?/addCut"
	use:enhance={() => {
		fetching = true;
		return async ({ update }) => {
			await update();
			fetching = false;
		};
	}}
>
	<input type="hidden" name="id" value={rollId} />
	<input type="hidden" name="length" value={length} />

	<h4>Add Cut</h4>

	<div class="length">
		<NumberInput
			label="Length"
			bind:value={yards}
			placeholder="yards"
			invalid={Boolean(errors.length)}
			invalidText={errors.length ?? undefined}
		/>

		<NumberInput bind:value={inches} placeholder="inches" />
	</div>
	<Select labelText="Reason" on:change={handleReasonChange} name="reason" selected={reason}>
		{#each reasons as reason}
			<SelectItem value={reason[0]} text={reason[1]} />
		{/each}
	</Select>
	<TextInput
		labelText="Notes"
		bind:value={notes}
		invalid={Boolean(errors.notes)}
		invalidText={errors.notes ?? undefined}
		name="notes"
	/>

	<Button type="submit" kind="secondary" {disabled}>Add</Button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1vh;
	}

	.length {
		display: flex;
		gap: 3vw;
		align-items: flex-end;
	}
</style>
