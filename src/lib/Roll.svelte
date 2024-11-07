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

	export let roll: TRoll;

	let fetching = false;
	let errorMsg: string | null = null;

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
			{#if roll.notes}
				<tr>
					<td>Notes</td>
					<td>{roll.notes}</td>
				</tr>
			{/if}
		</tbody>
	</Table>
	<AccessControl>
		<div style="height: 3vh" />

		<AddCut rollId={roll.id} {remaining} />
	</AccessControl>
	<div style="height: 3vh" />

	<Cuts {roll} />

	<div style="height: 3vh" />
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
