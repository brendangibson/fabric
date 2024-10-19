<script lang="ts">
	import { humanize } from '../dataFunctions/cuts';
	import type { TIncoming } from '../fabric';
	import { Table } from 'carbon-components-svelte';
	import { format } from 'date-fns';
	import { enhance } from '$app/forms';
	import AddIncoming from './AddIncoming.svelte';
	import InlineError from './InlineError.svelte';

	export let incoming: TIncoming;
	// export let styleColourId: string;

	let editMode = false;
	let errorMsg: string | null = null;
	let deleting = false;

	const handleEditClick = () => {
		editMode = true;
	};
</script>

{#if editMode}
	<AddIncoming
		{incoming}
		onCancel={() => (editMode = false)}
		onSuccess={() => (editMode = false)}
	/>
{:else}
	<Table>
		<tbody>
			<tr>
				<td><strong>Length</strong></td>
				<td>
					<div class="actionCell">
						{humanize(incoming.length)} yard{incoming.length === 1 ? '' : 's'}
						{#if !deleting}
							<button aria-label="Edit" on:click={handleEditClick} class="edit"> ✏️ </button>
							<form
								method="POST"
								action="?/deleteIncoming"
								use:enhance={() => {
									deleting = true;
									return async ({ result, update }) => {
										if (result.type === 'failure') {
											errorMsg = result.data?.error;
										} else {
											errorMsg = null;
											await update();
										}
										deleting = false;
									};
								}}
							>
								<input name="id" type="hidden" value={incoming.id} />
								<button class="delete"> ⊗ </button>
								<InlineError {errorMsg} />
							</form>
						{/if}
					</div>
				</td>
			</tr>
			{#if incoming.notes}
				<tr>
					<td>Notes</td>
					<td>{incoming.notes}</td>
				</tr>
			{/if}
			{#if incoming.orderId}
				<tr>
					<td>Order Id</td>
					<td>{incoming.orderId}</td>
				</tr>
			{/if}
			{#if incoming.expected}
				<tr>
					<td>Date expected</td>
					<td>
						{format(new Date(incoming.expected), 'MMMM d, yyyy')}
					</td>
				</tr>
			{/if}
		</tbody>
	</Table>
{/if}

<style>
	.actionCell {
		display: flex;
		font-weight: bold;
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
