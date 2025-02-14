<script lang="ts">
	import { humanize } from '../dataFunctions/cuts';
	import type { THold, TStyleColour } from '../fabric';
	import { Button, Table } from 'carbon-components-svelte';
	import { format } from 'date-fns';
	import { enhance } from '$app/forms';
	import AccessControl from './AccessControl.svelte';
	import Dimensions from './Dimensions.svelte';
	import AddHold from './AddHoldWrapper.svelte';
	import InlineError from './InlineError.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let hold: THold;
	export let styleColourId: string;
	export let styleColour: TStyleColour;

	let editMode = false;
	let deleteErrorMsg: string | null = null;
	let pendingErrorMsg: string | null = null;

	let approveButtonDisabled = false;
	let deleting = false;

	const handleEditClick = () => {
		editMode = true;
	};

	const handleEnhance: SubmitFunction = () => {
		approveButtonDisabled = true;

		return async ({ result, update }) => {
			// `result` is an `ActionResult` object
			if (result.type === 'failure') {
				deleteErrorMsg = result.data?.error;
			} else {
				deleteErrorMsg = null;
				await update();
			}
			approveButtonDisabled = false;
		};
	};

	const handleApproveEnhance: SubmitFunction = () => {
		approveButtonDisabled = true;

		return async ({ result, update }) => {
			// `result` is an `ActionResult` object
			if (result.type === 'failure') {
				pendingErrorMsg = result.data?.error;
			} else {
				pendingErrorMsg = null;
				await update();
			}
			approveButtonDisabled = false;
		};
	};
</script>

{#if editMode}
	<AddHold
		{hold}
		{styleColourId}
		onCancel={() => (editMode = false)}
		onSuccess={() => (editMode = false)}
	/>
{:else}
	<Table>
		<tbody>
			<tr>
				<td>
					<div class="actionCell">
						Length
						{#if styleColour.weight && styleColour.thickness}<Dimensions
								weight={styleColour.weight}
								length={54}
								thickness={styleColour.thickness}
							/>{/if}
					</div></td
				>
				<td>
					<div class="actionCell">
						{humanize(hold.length)} yard{hold.length === 1 ? '' : 's'}
						{#if !deleting}
							<button aria-label="Edit" on:click|preventDefault={handleEditClick} class="edit">
								✏️
							</button>
							<form method="POST" action="?/deleteHold" use:enhance={handleEnhance}>
								<input name="id" type="hidden" value={hold.id} />

								<button class="delete"> ⊗ </button>
								<InlineError errorMsg={deleteErrorMsg} />
							</form>
						{/if}
					</div>
				</td>
			</tr>
			<AccessControl>
				{#if hold.owner}
					<tr>
						<td>Owner</td>
						<td>{hold.owner}</td>
					</tr>
				{/if}
			</AccessControl>

			{#if hold.notes}
				<tr>
					<td>Notes</td>
					<td>{hold.notes}</td>
				</tr>
			{/if}
			{#if hold.orderId}
				<tr>
					<td>Order Id</td>
					<td>{hold.orderId}</td>
				</tr>
			{/if}
			{#if hold.timestamp}
				<tr>
					<td>Date requested</td>
					<td>
						{format(new Date(hold.timestamp), 'MMMM d, yyyy')}
					</td>
				</tr>
			{/if}
			{#if hold.expires}
				<tr>
					<td>Expires</td>
					<td>
						{format(new Date(hold.expires), 'MMMM d, yyyy')}
					</td>
				</tr>
			{/if}
			<AccessControl>
				{#if hold.pending}
					<tr>
						<td>Pending</td>
						<td
							><form method="POST" action="?/approveHold" use:enhance={handleApproveEnhance}>
								<input type="hidden" name="id" value={hold.id} />
								<Button type="submit" kind="secondary" disabled={approveButtonDisabled}
									>Approve</Button
								>
							</form>
							<InlineError errorMsg={pendingErrorMsg} />
						</td>
					</tr>
				{/if}
			</AccessControl>
		</tbody>
	</Table>
{/if}

<style>
	.actionCell {
		display: flex;
		font-weight: bold;
		align-items: center;
	}
	.delete {
		display: inline-block;
		margin-left: 16;
		vertical-align: top;
		cursor: pointer;
		color: sienna;
	}
	td {
		width: 50vw;
	}
	.edit {
		cursor: pointer;
		font-size: 0.75rem;
		padding-left: 16px;
	}
</style>
