<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Button,
		ButtonSet,
		DatePicker,
		DatePickerInput,
		NumberInput
	} from 'carbon-components-svelte';
	import type { THold } from '../fabric';
	import InlineError from './InlineError.svelte';

	export let styleColourId: string;
	export let hold: THold | undefined = undefined;
	export let onCancel = () => {
		/*deliberate*/
	};
	export let onSuccess = () => {
		/*deliberate*/
	};

	$: editing = Boolean(hold);
	$: length = editing ? hold?.length : 1;
	$: expires = editing ? hold?.expires : undefined;
	let errors: Record<string, string | null> = {
		length: null,
		expected: null
	};
	let fetching = false;
	let errorMsg: string | null = null;

	const setErrors = (index: string, value: number | undefined) => {
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

	$: setErrors('length', length);

	$: disabled = !(Boolean(length) && Boolean(expires)) || fetching;
</script>

<form
	method="POST"
	action={editing ? '?/updateHold' : '?/addHold'}
	use:enhance={() => {
		fetching = true;

		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMsg = result.data?.error;
			} else {
				errorMsg = null;
				await update();
				onSuccess();
			}
			fetching = false;
		};
	}}
>
	{#if editing}
		<input type="hidden" name="id" value={hold?.id} />
	{:else}
		<input type="hidden" name="id" value={styleColourId} />
	{/if}

	<h4>
		{#if editing}Update{:else}Add{/if} Hold
	</h4>

	<NumberInput
		label="Length"
		bind:value={length}
		placeholder="yards"
		invalid={Boolean(errors.length)}
		invalidText={errors.length ?? ''}
		name="length"
	/>
	<DatePicker datePickerType="single" bind:value={expires}>
		<DatePickerInput
			labelText="Expires"
			placeholder="mm/dd/yyyy"
			invalid={Boolean(errors.expires)}
			invalidText={errors.expires ?? undefined}
			name="expires"
		/>
	</DatePicker>

	<ButtonSet>
		<Button type="submit" kind="secondary" {disabled}
			>{#if editing}Update{:else}Add{/if}</Button
		>
		{#if editing}
			<Button type="tertiary" on:click={onCancel}>Cancel</Button>
		{/if}
	</ButtonSet>

	<InlineError {errorMsg} />
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1vh;
	}
</style>
