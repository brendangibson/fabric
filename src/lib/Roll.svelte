<script lang="ts">
	import { Button, Table } from 'carbon-components-svelte';
	import AccessControl from './AccessControl.svelte';
	import RollIcon from './RollIcon.svelte';
	import { getReasonName, humanize } from '../dataFunctions/cuts';
	import Dimensions from './Dimensions.svelte';
	import { format, subMinutes } from 'date-fns';
	import AddCut from './AddCut.svelte';
	import type { TRoll } from '../fabric';
	import { enhance } from '$app/forms';
	import InlineError from './InlineError.svelte';

	export let roll: TRoll;

	let fetching = false;
	let errorMsg: string | null = null;

	const label = `${roll.styleColour?.style} ${roll.styleColour?.colour}`;
	$: remaining =
		roll.originalLength ??
		0 - roll.cuts.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0);

	$: sortedCuts = [
		...(roll?.cuts?.sort((a, b) =>
			new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ? -1 : 1
		) ?? [])
	];
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

	<h1>Cuts</h1>
	{#if sortedCuts && sortedCuts.length}
		<Table style=" tableLayout: fixed">
			<tbody>
				{#each sortedCuts as cut}
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
							<strong>{humanize(cut.length)} yard{cut.length === 1 ? '' : 's'}</strong>
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
				{/each}
			</tbody>
		</Table>
	{:else}
		<p>Fresh roll</p>
	{/if}

	<div style="height: 3vh" />
	<AccessControl>
		<form
			method="POST"
			action={roll.returned ? '?/unReturnRoll' : '?/returnRoll'}
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'failure') {
						errorMsg = result.data?.error;
					} else {
						errorMsg = null;
						await update();
					}
				};
			}}
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

<style>
	.length {
		display: flex;
		font-weight: bold;
		align-items: baseline;
	}
</style>
