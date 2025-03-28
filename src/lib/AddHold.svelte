<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Button,
		ButtonSet,
		DatePicker,
		DatePickerInput,
		NumberInput,
		TextInput
	} from 'carbon-components-svelte';
	import type { THold } from '../fabric';
	import InlineError from './InlineError.svelte';
	import AccessControl from './AccessControl.svelte';
	import { addWeeks } from 'date-fns';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let styleColourId: string;
	export let hold: THold | undefined = undefined;
	export let onCancel = () => {
		/*deliberate*/
	};
	export let onSuccess = () => {
		/*deliberate*/
	};
	export let username: string;

	let editing = Boolean(hold);
	let length = editing ? hold?.length : 1;
	let owner = editing ? hold?.owner : username;
	let expires = editing ? hold?.expires : addWeeks(new Date(), 2).toISOString();
	let notes = editing ? hold?.notes : '';
	let errors: Record<string, string | null> = {
		length: null,
		expected: null
	};
	let fetching = false;
	let errorMsg: string | null = null;

	const setErrors = (index: string, value: number | undefined) => {
		switch (index) {
			case 'length':
				if (value === undefined || value === null || isNaN(value)) {
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

	const handleEnhance: SubmitFunction = () => {
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
	};

	$: setErrors('length', length);

	$: disabled = !(Boolean(length) && Boolean(expires)) || fetching;
</script>

<form method="POST" action={editing ? '?/updateHold' : '?/addHold'} use:enhance={handleEnhance}>
	{#if editing}
		<input type="hidden" name="id" value={hold?.id} />
	{:else}
		<input type="hidden" name="id" value={styleColourId} />
	{/if}

	<h4>
		{#if editing}Update{:else}Add{/if} Reserve
	</h4>

	<NumberInput
		label="Length"
		bind:value={length}
		placeholder="yards"
		invalid={Boolean(errors.length)}
		invalidText={errors.length ?? ''}
		name="length"
		step={0.01}
		pattern="[0-9.]*"
	/>

	<AccessControl>
		<TextInput
			labelText="Owner"
			bind:value={owner}
			invalid={Boolean(errors.owner)}
			invalidText={errors.owner ?? ''}
			name="owner"
		/>
		<div slot="else">
			<input type="hidden" name="owner" value={owner} />
		</div>
	</AccessControl>
	<DatePicker datePickerType="single" bind:value={expires}>
		<DatePickerInput
			labelText="Expires"
			placeholder="mm/dd/yyyy"
			invalid={Boolean(errors.expires)}
			invalidText={errors.expires ?? undefined}
			name="expires"
		/>
	</DatePicker>

	<TextInput
		labelText="Sidemark"
		bind:value={notes}
		invalid={Boolean(errors.notes)}
		invalidText={errors.notes ?? ''}
		name="notes"
	/>

	<ButtonSet>
		<Button type="submit" kind="secondary" {disabled}
			>{#if editing}Update{:else}Add{/if}</Button
		>
		{#if editing}
			<Button type="ghost" on:click={onCancel}>Cancel</Button>
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
