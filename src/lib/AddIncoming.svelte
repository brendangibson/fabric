<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Button,
		ButtonSet,
		DatePicker,
		DatePickerInput,
		NumberInput
	} from 'carbon-components-svelte';
	import type { TIncoming } from '../fabric';
	import InlineError from './InlineError.svelte';

	export let styleColourId: string | undefined = undefined;
	export let incoming: TIncoming | null = null;
	export let onCancel = () => {
		/*deliberate*/
	};
	export let onSuccess = () => {
		/*deliberate*/
	};

	let editing = Boolean(incoming);
	let length = editing ? incoming?.length : 1;
	let expected =
		editing && incoming?.expected ? new Date(incoming?.expected).toISOString() : undefined;
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

	$: disabled = !(Boolean(length) && Boolean(expected)) || fetching;
</script>

<form
	method="POST"
	action={editing ? '?/updateIncoming' : '?/addIncoming'}
	use:enhance={() => {
		fetching = true;

		return async ({ result, update }) => {
			console.log('result: ', result);
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
		<input type="hidden" name="id" value={incoming?.id} />
	{:else}
		<input type="hidden" name="id" value={styleColourId} />
	{/if}
	<input type="hidden" name="expected" value={expected} />

	<h4>
		{#if editing}Edit{:else}Add{/if} Incoming Fabric
	</h4>

	<NumberInput
		label="Length"
		bind:value={length}
		placeholder="yards"
		invalid={Boolean(errors.length)}
		invalidText={errors.length ?? undefined}
		name="length"
	/>
	<DatePicker datePickerType="single" bind:value={expected}>
		<DatePickerInput
			labelText="Expected"
			placeholder="mm/dd/yyyy"
			invalid={Boolean(errors.expected)}
			invalidText={errors.expected ?? undefined}
			name="expected"
		/>
	</DatePicker>

	<ButtonSet>
		<Button type="submit" kind="secondary" {disabled}
			>{#if editing}Update{:else}Add{/if}</Button
		>
		{#if editing}
			<Button kind="tertiary" on:click={onCancel}>Cancel</Button>
		{/if}</ButtonSet
	>
	<InlineError {errorMsg} />
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1vh;
	}
</style>
