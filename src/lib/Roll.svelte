<script lang="ts">
	import { Button, Table } from 'carbon-components-svelte';
	import AccessControl from './AccessControl.svelte';
	import RollIcon from './RollIcon.svelte';
	import { humanize } from '../dataFunctions/cuts';
	import AddCut from './AddCut.svelte';
	import type { TRoll } from '../fabric';
	import { enhance } from '$app/forms';
	import InlineError from './InlineError.svelte';
	import { calculateRemaining } from '../dataFunctions/rolls';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Cuts from './Cuts.svelte';
	import UpdateNotes from './UpdateNotes.svelte';

	export let roll: TRoll;

	let fetching = false;
	let errorMsg: string | null = null;
	let editMode = false;
	const label = `${roll.styleColour?.style} ${roll.styleColour?.colour}`;

	const handleEnhance: SubmitFunction = () => {
		fetching = true;

		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMsg = result.data?.error;
			} else {
				errorMsg = null;
				await update();
			}
			fetching = false;
		};
	};

	const handleEditClick = () => {
		editMode = true;
	};

	$: remaining = calculateRemaining(roll);
</script>

<div>
	<RollIcon
		originalLength={roll.originalLength ?? 0}
		swatchUrl={roll.styleColour?.swatchUrl ?? ''}
		glenRavenId={roll.glenRavenId ?? ''}
		{remaining}
	/>

	<Table>
		<tbody>
			<tr>
				<td>Style Colour</td>
				<td>
					<b>{label}</b>
				</td>
			</tr>
			<tr>
				<td>Length</td>
				<td>
					{humanize(remaining)}/{roll.originalLength} yards
				</td>
			</tr>
			{#if roll.shipment}
				<tr>
					<td>Shipment</td>
					<td>
						{roll.shipment.name || roll.shipment.dateReceived || roll.shipment.dateSent}
					</td>
				</tr>
			{/if}
			<tr>
				<td>Notes</td>
				<td
					>{#if editMode}<UpdateNotes
							{roll}
							onCancel={() => (editMode = false)}
							onSuccess={() => (editMode = false)}
						/>{:else}{roll.notes}<button
							aria-label="Edit"
							on:click|preventDefault={handleEditClick}
							class="edit"
						>
							✏️
						</button>{/if}</td
				>
			</tr>
		</tbody>
	</Table>
	<AccessControl>
		<div style="height: 3vh"></div>

		<AddCut rollId={roll.id} {remaining} />
	</AccessControl>
	<div style="height: 3vh"></div>

	<Cuts {roll} />

	<div style="height: 3vh"></div>
	<AccessControl>
		<form
			method="POST"
			action={roll.returned ? '?/unReturnRoll' : '?/returnRoll'}
			use:enhance={handleEnhance}
		>
			<input type="hidden" name="id" value={roll.id} />
			{#if roll.returned}
				<Button type="submit" kind="secondary" disabled={fetching}>Undo "Return Roll"</Button>
			{:else}
				<Button type="submit" kind="secondary" disabled={fetching}>Return Roll</Button>
			{/if}
			<InlineError {errorMsg} />
		</form>
	</AccessControl>
</div>
