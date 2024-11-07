<script lang="ts">
	import { Table } from 'carbon-components-svelte';

	import type { TRoll } from '../fabric';
	import Cut from './Cut.svelte';

	export let roll: TRoll;

	$: sortedCuts = [
		...(roll?.cuts?.sort((a, b) =>
			new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ? 1 : -1
		) ?? [])
	];
</script>

<h3>Cuts</h3>
{#if sortedCuts && sortedCuts.length}
	<Table style=" tableLayout: fixed">
		<tbody>
			{#each sortedCuts as cut}
				<Cut {cut} {roll} />
			{/each}
		</tbody>
	</Table>
{:else}
	<p>Fresh roll</p>
{/if}
