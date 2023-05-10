<script lang="ts">
	import { Table } from 'carbon-components-svelte';
	import type { TStyleColour } from '../fabric';
	import { humanize } from '../dataFunctions/cuts';

	export let stylesColours: TStyleColour[];

	let sortBy: string | null = 'name';
	let sortDirection = true;

	const daysRemaining = (styleColour: TStyleColour) =>
		((styleColour.remaining ?? 0) +
			(styleColour.incomingLength ?? 0) +
			(styleColour.standbyLength ?? 0) -
			(styleColour.holdsLength ?? 0)) /
		(styleColour.rate ?? 1);

	const setSortBy = (col: string) => {
		if (sortBy === col) {
			sortDirection = !sortDirection;
		} else {
			sortBy = col;
		}
	};

	$: sortedStylesColours = stylesColours
		? [
				...stylesColours.sort((a, b) => {
					const aName = `${a.style} ${a.colour}`;
					const bName = `${b.style} ${b.colour}`;
					switch (sortBy) {
						case 'name':
							return bName.localeCompare(aName);
						case 'remaining':
							return (b.remaining ?? 0) - (a.remaining ?? 0);
						case 'incoming':
							return (b.incomingLength ?? 0) - (a.incomingLength ?? 0);
						case 'standby':
							return (b.standbyLength ?? 0) - (a.standbyLength ?? 0);
						case 'holds':
							return (b.holdsLength ?? 0) - (a.holdsLength ?? 0);
						case 'rate':
							return (b.rate ?? 0) - (a.rate ?? 0);
						case 'daysRemaining':
							return (daysRemaining(b) ?? 0) - (daysRemaining(a) ?? 0);
						default:
							return 0;
					}
				})
		  ]
		: [];

	$: sortDirection, (sortedStylesColours = [...sortedStylesColours].reverse());
</script>

<Table>
	<thead>
		<tr>
			<th on:click={() => setSortBy('name')} colSpan={2}>Style Colour</th>
			<th on:click={() => setSortBy('remaining')}>Remaining (yds)</th>
			<th on:click={() => setSortBy('incoming')}>Incoming (yds)</th>
			<th on:click={() => setSortBy('standby')}>Standby (yds)</th>
			<th on:click={() => setSortBy('holds')}>Holds (yds)</th>
			<th on:click={() => setSortBy('rate')}>Daily Rate</th>
			<th on:click={() => setSortBy('daysRemaining')}>Days remaining</th>
		</tr>
	</thead>
	<tbody>
		{#if sortedStylesColours}
			{#each sortedStylesColours as styleColour}
				<tr>
					<td>
						<a href={`/stylecolour/${styleColour.id}`}>
							<img
								class="swatch"
								src={styleColour.swatchUrl}
								alt={`${styleColour.style} ${styleColour.colour}`}
							/>
						</a>
					</td>
					<td>{`${styleColour.style} ${styleColour.colour}`}</td>
					<td>{humanize(styleColour.remaining ?? 0)}</td>
					<td>{humanize(styleColour.incomingLength ?? 0)}</td>
					<td>{humanize(styleColour.standbyLength ?? 0)}</td>
					<td>{humanize(styleColour.holdsLength ?? 0)}</td>
					<td>{humanize(styleColour.rate ?? 0)}</td>
					<td>
						{humanize(daysRemaining(styleColour))}
					</td>
				</tr>
			{/each}
		{/if}
	</tbody>
</Table>

<style>
	th {
		cursor: ns-resize;
	}

	.swatch {
		height: 20vw;
		width: 20vw;
	}
</style>
