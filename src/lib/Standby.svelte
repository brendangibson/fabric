<script lang="ts">
	import { humanize } from '../dataFunctions/cuts';
	import type { TStandby } from '../fabric';
	import { Table } from 'carbon-components-svelte';
	import { enhance } from '$app/forms';
	import AddStandby from './AddStandby.svelte';
	import InlineError from './InlineError.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let standby: TStandby;
	export let styleColourId: string;

	let errorMsg: string | null = null;
	let deleting = false;
	let editMode = false;

	const handleEditClick = () => {
		editMode = true;
	};

	const handleEnhance: SubmitFunction = () => {
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
	};
</script>

{#if editMode}
	<AddStandby
		{standby}
		{styleColourId}
		onCancel={() => (editMode = false)}
		onSuccess={() => (editMode = false)}
	/>
{:else}
	<Table>
		<tbody>
			<tr>
				<td>Length</td>
				<td>
					<div class="actionCell">
						{humanize(standby.length)} yard{standby.length === 1 ? '' : 's'}
						{#if !deleting}
							<button aria-label="Edit" on:click={handleEditClick} class="edit"> ✏️ </button>
							<form method="POST" action="?/deleteStandby" use:enhance={handleEnhance}>
								<input name="id" type="hidden" value={standby.id} />
								<button class="delete"> ⊗ </button>
								<InlineError {errorMsg} />
							</form>
						{/if}
					</div>
				</td>
			</tr>
		</tbody>
	</Table>
{/if}

<style>
	.actionCell {
		display: flex;
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
