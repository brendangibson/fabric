<script lang="ts">
	import { Table } from 'carbon-components-svelte';
	import type { TStyleColour } from '../fabric';
	import { humanize } from '../dataFunctions/cuts';
	import Swatch from './Swatch.svelte';

	export let stylesColours: TStyleColour[];

	const costPerYard = 80;

	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	});

	let sortBy: string | null = 'name';
	let sortDirection = true;

	const daysRemaining = (styleColour: TStyleColour) =>
		((styleColour.remaining ?? 0) +
			(styleColour.incomingLength ?? 0) +
			(styleColour.standbyLength ?? 0) -
			(styleColour.holdsLength ?? 0)) /
		(styleColour.rate ?? 0.0001);

	const setSortBy = (col: string) => {
		if (sortBy === col) {
			sortDirection = !sortDirection;
		} else {
			sortBy = col;
		}
	};

	let directionallySortedStylesColours: TStyleColour[] = [];

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

	$: {
		if (sortDirection) {
			directionallySortedStylesColours = [...sortedStylesColours].reverse();
		} else {
			directionallySortedStylesColours = [...sortedStylesColours];
		}
	}
</script>

<div class="tableWrapper">
	<Table>
		<thead>
			<tr>
				<th />
				<th on:click={() => setSortBy('name')}
					>Style Colour <span class="arrow"
						>{#if sortBy === 'name'}{#if sortDirection}↑{:else}↓{/if}{/if}</span
					></th
				>
				<th on:click={() => setSortBy('remaining')}
					>Remaining (yds) <span class="arrow"
						>{#if sortBy === 'remaining'}{#if sortDirection}↑{:else}↓{/if}{/if}</span
					></th
				>
				<th on:click={() => setSortBy('incoming')}
					>Incoming (yds) <span class="arrow"
						>{#if sortBy === 'incoming'}{#if sortDirection}↑{:else}↓{/if}{/if}</span
					></th
				>
				<th on:click={() => setSortBy('standby')}
					>Standby (yds) <span class="arrow"
						>{#if sortBy === 'standby'}{#if sortDirection}↑{:else}↓{/if}{/if}</span
					></th
				>
				<th on:click={() => setSortBy('holds')}
					>Reserved (yds) <span class="arrow"
						>{#if sortBy === 'holds'}{#if sortDirection}↑{:else}↓{/if}{/if}</span
					></th
				>
				<th on:click={() => setSortBy('rate')}
					>Daily Rate <span class="arrow"
						>{#if sortBy === 'rate'}{#if sortDirection}↑{:else}↓{/if}{/if}</span
					></th
				>
				<th on:click={() => setSortBy('daysRemaining')}
					>Days remaining <span class="arrow"
						>{#if sortBy === 'daysRemaining'}{#if sortDirection}↑{:else}↓{/if}{/if}</span
					></th
				>
			</tr>
		</thead>
		<tbody>
			{#if directionallySortedStylesColours}
				<tr>
					<td>
						<strong>Total</strong>
					</td>
					<td>-</td>
					<td
						>{humanize(
							directionallySortedStylesColours.reduce((accum, sc) => accum + (sc.remaining ?? 0), 0)
						)}</td
					>
					<td
						>{humanize(
							directionallySortedStylesColours.reduce(
								(accum, sc) => accum + (sc.incomingLength ?? 0),
								0
							)
						)}</td
					>
					<td
						>{humanize(
							directionallySortedStylesColours.reduce(
								(accum, sc) => accum + (sc.standbyLength ?? 0),
								0
							)
						)}</td
					>
					<td
						>{humanize(
							directionallySortedStylesColours.reduce(
								(accum, sc) => accum + (sc.holdsLength ?? 0),
								0
							)
						)}</td
					>
					<td>-</td>
					<td> - </td>
				</tr>
				<tr>
					<td>
						<strong>Total ($)</strong>
					</td>
					<td>-</td>
					<td
						>{formatter.format(
							directionallySortedStylesColours.reduce(
								(accum, sc) => accum + (sc.remaining ?? 0),
								0
							) * costPerYard
						)}</td
					>
					<td
						>{formatter.format(
							directionallySortedStylesColours.reduce(
								(accum, sc) => accum + (sc.incomingLength ?? 0),
								0
							) * costPerYard
						)}</td
					>
					<td
						>{formatter.format(
							directionallySortedStylesColours.reduce(
								(accum, sc) => accum + (sc.standbyLength ?? 0),
								0
							) * costPerYard
						)}</td
					>
					<td
						>{formatter.format(
							directionallySortedStylesColours.reduce(
								(accum, sc) => accum + (sc.holdsLength ?? 0),
								0
							) * costPerYard
						)}</td
					>
					<td>-</td>
					<td> - </td>
				</tr>
				{#each directionallySortedStylesColours as styleColour}
					<tr>
						<td>
							<a href={`/stylecolour/${styleColour.id}`} class="swatch">
								<Swatch src={styleColour.swatchUrl} />
							</a>
						</td>
						<td>{`${styleColour.style} ${styleColour.colour}`}</td>
						<td>{humanize(styleColour.remaining ?? 0)}</td>
						<td>{humanize(styleColour.incomingLength ?? 0)}</td>
						<td>{humanize(styleColour.standbyLength ?? 0)}</td>
						<td>{humanize(styleColour.holdsLength ?? 0)}</td>
						<td>{humanize(styleColour.rate ?? 0)}</td>
						<td>
							{#if daysRemaining(styleColour) > 10000}Infinity{:else}
								{humanize(daysRemaining(styleColour))}
							{/if}
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</Table>
</div>

<style>
	th:not(:first-child) {
		cursor: pointer;
	}

	td:nth-child(n + 3),
	th:nth-child(n + 3) {
		text-align: right;
	}

	.swatch {
		display: block;
		height: 20vw;
		width: 20vw;
	}

	.tableWrapper {
		position: relative;
	}

	thead th {
		position: sticky;
		top: 8vh;
		white-space: nowrap;
	}

	.arrow {
		width: 1em;
		display: inline-block;
	}
</style>
