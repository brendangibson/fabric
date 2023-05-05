<script lang="ts">
	import { humanize } from '../dataFunctions/cuts';
	import type { THold } from '../fabric';
	import { Button, Table } from 'carbon-components-svelte';
	import { format } from 'date-fns';
	import { enhance } from '$app/forms';
	import AccessControl from './AccessControl.svelte';

	export let hold: THold;
	export let styleColourId: string;

	let editMode = false;

	const handleEditClick = () => {
		editMode = true;
	};

	const handleUpdateHoldComplete = () => {
		editMode = false;
	};
</script>

{#if editMode}
	<!-- <UpdateIncoming
		{hold}
		colourStyleId={styleColourId}
		{refetchQueries}
		onComplete={handleUpdateIncomingComplete}
	/> -->
{:else}
	<Table>
		<tbody>
			<tr>
				<td>Length</td>
				<td>
					{humanize(hold.length)} yard{hold.length === 1 ? '' : 's'}
					<button aria-label="Edit" on:click={handleEditClick} class="edit"> ✏️ </button>
					<form method="POST" action="?/deleteIncoming" use:enhance>
						<input name="id" type="hidden" value={hold.id} />
						<button class="delete"> ⊗ </button>
					</form>
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
			{#if hold.pending}
				<tr>
					<td>Pending</td>
					<td
						><form><Button type="submit" kind="secondary">Approve</Button></form>
						></td
					>
				</tr>
			{/if}
		</tbody>
	</Table>
{/if}

<style>
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
