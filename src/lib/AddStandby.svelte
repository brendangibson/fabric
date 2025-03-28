<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, ButtonSet, NumberInput } from 'carbon-components-svelte';
	import type { TStandby } from '../fabric';
	import InlineError from './InlineError.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let styleColourId: string;
	export let standby: TStandby | undefined = undefined;
	export let onCancel = () => {
		/*deliberate*/
	};
	export let onSuccess = () => {
		/*deliberate*/
	};

	$: editing = Boolean(standby);

	$: length = editing ? standby?.length : 1;
	let errors: Record<string, string | null> = {
		length: null
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
			// `result` is an `ActionResult` object
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

	$: disabled = !length || fetching;
</script>

<form
	method="POST"
	action={editing ? '?/updateStandby' : '?/addStandby'}
	use:enhance={handleEnhance}
>
	{#if editing}
		<input type="hidden" name="id" value={standby?.id} />
	{:else}
		<input type="hidden" name="id" value={styleColourId} />
	{/if}
	<h4>
		{#if editing}Edit{:else}Add{/if} Fabric on Standby
	</h4>

	<NumberInput
		label="Length"
		bind:value={length}
		placeholder="yards"
		invalid={Boolean(errors.length)}
		invalidText={errors.length ?? undefined}
		name="length"
		step={0.01}
		pattern="[0-9.]*"
	/>

	<ButtonSet>
		<Button type="submit" kind="secondary" {disabled}
			>{#if editing}Update{:else}Add{/if}</Button
		>
		{#if editing}
			<Button kind="ghost" on:click={onCancel}>Cancel</Button>
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
