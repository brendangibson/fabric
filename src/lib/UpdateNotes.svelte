<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, ButtonSet, TextInput } from 'carbon-components-svelte';
	import type { TRoll } from '../fabric';
	import InlineError from './InlineError.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let roll: TRoll | undefined = undefined;
	export let onCancel = () => {
		/*deliberate*/
	};
	export let onSuccess = () => {
		/*deliberate*/
	};

	let notes = roll?.notes ?? '';
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
</script>

<form method="POST" action="?/updateNotes" use:enhance={handleEnhance}>
	<input type="hidden" name="id" value={roll?.id} />

	<TextInput
		bind:value={notes}
		invalid={Boolean(errors.notes)}
		invalidText={errors.notes ?? ''}
		name="notes"
	/>

	<ButtonSet>
		<Button type="submit" kind="secondary">Save</Button>
		<Button type="ghost" on:click={onCancel}>Cancel</Button>
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
