<script lang="ts">
	import { Table } from 'carbon-components-svelte';
	import AccessControl from './AccessControl.svelte';
	import { format } from 'date-fns';
	import type { TShipment } from '../fabric';
	import AddShipment from './AddShipment.svelte';

	export let shipments: TShipment[];

	$: sortedShipments = shipments
		? [
				...shipments.sort((a, b) =>
					new Date(a.dateReceived).getTime() < new Date(b.dateReceived).getTime() ? 1 : -1
				)
			]
		: [];
</script>

<div class="shipments">
	<AccessControl>
		<AddShipment />
	</AccessControl>
	<div style="height: 3vh"></div>

	<h3>Shipments</h3>
	{#if sortedShipments}
		<Table style="margin-top: 1vh; table-layout: fixed;">
			<tbody>
				{#each sortedShipments as shipment}
					<tr>
						<td>Name</td>
						<td>
							<strong>{shipment.name}</strong>
						</td>
					</tr>
					<tr>
						<td>Date Sent</td>
						<td>{format(new Date(shipment.dateSent), 'MMMM d, yyyy')}</td>
					</tr>
					<tr>
						<td>Date Received</td>
						<td>{format(new Date(shipment.dateReceived), 'MMMM d, yyyy')}</td>
					</tr>
					<tr>
						<td>Glenraven Id</td>
						<td>{shipment.glenRavenId}</td>
					</tr>
				{/each}
			</tbody>
		</Table>
	{/if}
</div>

<style>
	.shipments {
		display: flex;
		flex-direction: column;
	}
</style>
