<script lang="ts">
	import { getReasonName, humanize } from '../dataFunctions/cuts';
	import { format, subMinutes } from 'date-fns';
	import Dimensions from './Dimensions.svelte';
	import type { TCut, TRoll } from '../fabric';
	import { enhance } from '$app/forms';
	import InlineError from './InlineError.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Button, ComposedModal, ModalFooter, ModalHeader } from 'carbon-components-svelte';

	export let cut: TCut;
	export let roll: TRoll;

	let deleting = false;
	let deleteErrorMsg: string | null = null;
	let confirming = false;

	const handleEnhance: SubmitFunction = () => {
		deleting = true;
		confirming = false;
		return async ({ result, update }) => {
			// `result` is an `ActionResult` object
			if (result.type === 'failure') {
				deleteErrorMsg = result.data?.error;
			} else {
				deleteErrorMsg = null;
				await update();
			}
			deleting = false;
		};
	};
</script>

<tr>
	<td>
		<div class="length">
			Length

			<Dimensions
				weight={roll.styleColour?.weight ?? 0}
				thickness={roll.styleColour?.thickness ?? 0}
				length={cut.length}
			/>
		</div>
	</td>
	<td>
		<div class="lengthRight">
			<strong>{humanize(cut.length)} yard{cut.length === 1 ? '' : 's'}</strong>
			{#if !deleting}
				<form id="deleteForm" method="POST" action="?/deleteCut" use:enhance={handleEnhance}>
					<ComposedModal danger bind:open={confirming}>
						<ModalHeader label="Delete Cut" title="Confirm deletion" />
						<ModalFooter
							><Button type="button" kind="secondary" on:click={() => (confirming = false)}
								>Cancel</Button
							><Button type="submit">Delete</Button></ModalFooter
						>
					</ComposedModal>

					<input name="id" type="hidden" value={cut.id} />

					<button class="delete" type="button" on:click={() => (confirming = true)}> ⊗ </button>
					<InlineError errorMsg={deleteErrorMsg} />
				</form>
			{/if}
		</div>
	</td>
</tr>
<tr>
	<td>Time</td>
	<td>
		{format(
			subMinutes(new Date(cut.timestamp), new Date(cut.timestamp).getTimezoneOffset()),
			'MMMM d yyyy, hh:mm aaa'
		)}
	</td>
</tr>
<tr>
	<td>Reason</td>
	<td>{getReasonName(cut.reason)}</td>
</tr>
{#if cut.notes}
	<tr>
		<td>Notes</td>
		<td>{cut.notes}</td>
	</tr>
{/if}
{#if cut.orderId}
	<tr>
		<td>Order Id</td>
		<td>{cut.orderId}</td>
	</tr>
{/if}

<style>
	.length {
		display: flex;
		font-weight: bold;
		align-items: baseline;
	}

	.lengthRight {
		display: flex;
		align-items: center;
	}
</style>
