<script lang="ts">
	import { Button, Table } from 'carbon-components-svelte';
	import AccessControl from './AccessControl.svelte';
	import RollIcon from './RollIcon.svelte';
	import { getReasonName, humanize } from '../dataFunctions/cuts';
	import Dimensions from './Dimensions.svelte';
	import { format } from 'date-fns';
	import AddCut from './AddCut.svelte';
	import type { TRoll } from '../fabric';
	import { enhance } from '$app/forms';

	export let roll: TRoll;

	let fetching = false;

	const label = `${roll.styleColour?.style} ${roll.styleColour?.colour}`;
	const remaining =
		roll.originalLength ??
		0 - roll.cuts.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0);

	const sortedCuts =
		roll?.cuts?.sort((a, b) =>
			new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ? -1 : 1
		) ?? [];
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
		<AddCut rollId={roll.id} {remaining} />
	</AccessControl>
	<div style="height 3vh" />

	<h1>Cuts</h1>
	{#each sortedCuts as cut}
		<Table style=" tableLayout: fixed">
			<tbody>
				<tr>
					<td>Time</td>
					<td>
						{format(new Date(cut.timestamp), 'MMMM d yyyy, hh:mm')}
					</td>
				</tr>
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
						{humanize(cut.length)} yard{cut.length === 1 ? '' : 's'}
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
			</tbody>
		</Table>
	{/each}

	<div style="height: 3vh" />
	<AccessControl>
		<form
			method="POST"
			action={roll.returned ? '?/unReturnRoll' : '?/returnRoll'}
			use:enhance={() => {
				fetching = true;
				return async ({ update }) => {
					await update();
					fetching = false;
				};
			}}
		>
			<input type="hidden" name="id" value={roll.id} />
			{#if roll.returned}
				<Button type="submit" kind="secondary" disabled={fetching}>Undo "Return Roll"</Button>
			{:else}
				<Button type="submit" kind="secondary" disabled={fetching}>Return Roll</Button>
			{/if}
		</form>
	</AccessControl>
</div>

<style>
	.length {
		display: flex;
	}
</style>
