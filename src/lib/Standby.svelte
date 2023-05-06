<script lang="ts">
	import { humanize } from '../dataFunctions/cuts';
	import type { TStandby } from '../fabric';
	import { Table } from 'carbon-components-svelte';
	import { enhance } from '$app/forms';

	export let standby: TStandby;
	export let styleColourId: string;

	let editMode = false;

	const handleEditClick = () => {
		editMode = true;
	};
</script>

{#if editMode}
	<!-- <UpdateStandby
		{standby}
		colourStyleId={styleColourId}
		{refetchQueries}
		onComplete={handleUpdateStandbyComplete}
	/> -->
{:else}
	<Table>
		<tbody>
			<tr>
				<td>Length</td>
				<td>
					{humanize(standby.length)} yard{standby.length === 1 ? '' : 's'}
					<button aria-label="Edit" on:click={handleEditClick} class="edit"> ✏️ </button>
					<form method="POST" action="?/deleteStandby" use:enhance>
						<input name="id" type="hidden" value={styleColourId} />
						<button class="delete"> ⊗ </button>
					</form>
				</td>
			</tr>
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
