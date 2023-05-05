<script lang="ts">
	import { humanize } from '../dataFunctions/cuts';
	import type { TIncoming } from '../fabric';
	import { Table } from 'carbon-components-svelte';
	import { format } from 'date-fns';
	import { enhance } from '$app/forms';

	export let incoming: TIncoming;
	export let styleColourId: string;

	let editMode = false;

	const handleEditClick = () => {
		editMode = true;
	};

	const handleUpdateIncomingComplete = () => {
		editMode = false;
	};
</script>

{#if editMode}
	<!-- <UpdateIncoming
		{incoming}
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
					{humanize(incoming.length)} yard{incoming.length === 1 ? '' : 's'}
					<button aria-label="Edit" on:click={handleEditClick} class="edit"> ✏️ </button>
					<form method="POST" action="?/deleteIncoming" use:enhance>
						<input name="id" type="hidden" value={incoming.id} />
						<button class="delete"> ⊗ </button>
					</form>
					<!-- <Mutation
              mutation={MutationDeleteIncoming}
              refetchQueries={refetchQueries}
            >
              {(deleteIncoming, { loading, error }) => (
                <span
                  onClick={deleteIncomingMutation(deleteIncoming, incoming.id)}
                  style={deleteStyle}
                >
                  ⊗
                </span>
              )}
            </Mutation> -->
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
