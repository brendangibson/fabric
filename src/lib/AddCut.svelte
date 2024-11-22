<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, NumberInput, Select, SelectItem, TextInput } from 'carbon-components-svelte';
	import { reasons } from '../dataFunctions/cuts';
	import InlineError from './InlineError.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let rollId: string;
	export let remaining: number;

	let yards = 0;
	let inches = 0;
	let reason = 'otherOrder';
	let notes = '';

	let fetching = false;
	let errorMsg: string | null = null;
	let tainted = false;

	let errors: Record<string, string | null> = {
		length: null
	};

	const setErrors = (index: string, value: number) => {
		switch (index) {
			case 'length':
				if (value === null || value === undefined || isNaN(value)) {
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

	const handleChange = () => {
		tainted = true;
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

	$: length = yards + inches / 36;

	$: setErrors('length', length);

	$: disabled = !(length + inches > 0) || fetching;
</script>

<form method="POST" action="?/addCut" use:enhance={handleEnhance}>
	<input type="hidden" name="id" value={rollId} />
	<input type="hidden" name="length" value={length} />

	<h4>Add Cut</h4>

	<div class="length">
		<NumberInput
			label="Length"
			bind:value={yards}
			placeholder="yards"
			invalid={tainted && Boolean(errors.length)}
			invalidText={errors.length ?? ''}
			step={0.01}
			helperText="yards"
			on:change={handleChange}
			pattern="[0-9.]*"
		/>

		<NumberInput
			bind:value={inches}
			placeholder="inches"
			helperText="inches"
			on:change={handleChange}
		/>
	</div>
	<Select labelText="Reason" bind:selected={reason} name="reason">
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
	<InlineError {errorMsg} />
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
