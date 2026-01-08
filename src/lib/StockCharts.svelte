<script lang="ts">
	import ChartLine from './ChartLine.svelte';
	import {
		Chart,
		Title,
		Tooltip,
		Legend,
		LinearScale,
		LineElement,
		PointElement,
		TimeScale,
		TimeSeriesScale,
		LineController
	} from 'chart.js';
	import 'chartjs-adapter-date-fns';
	import { enUS } from 'date-fns/locale';
	import Swatch from './Swatch.svelte';
	import { minRollSize } from '$src/constants';

	Chart.register(
		Title,
		Tooltip,
		Legend,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		TimeScale,
		TimeSeriesScale
	);
	export let allCuts: { timestamp: number; length: number; rollId: string }[];
	export let allRolls: { id: string; timestamp: number; length: number }[];
	export let stylesColoursCuts: {
		timestamp: number;
		length: number;
		rollId: string;
		colour: string;
		style: string;
		styleColourId: string;
		swatchUrl: string;
	}[];
	export let stylesColoursRolls: {
		id: string;
		timestamp: number;
		length: number;
		colour: string;
		style: string;
		styleColourId: string;
		swatchUrl: string;
	}[];

	const lineColor = '#b264c178';

	type TMeta = { swatchUrl: string; colour: string; style: string; styleColourId: string };
	type TData = { x: number; y: number };

	// Get the earliest timestamp from rolls
	let minTimestamp = allRolls.length > 0 ? allRolls[0].timestamp : Date.now();

	// Calculate stock levels over time using the same logic as the status page
	// KEY CHANGE: Instead of chronological processing (applying each cut individually),
	// we now use the same logic as the status page: sum all cuts for each roll,
	// then subtract the total from the original length. This ensures the chart
	// matches the status page exactly.
	$: allData = (() => {
		const data: TData[] = [];

		// Sort all events chronologically
		const events = [
			...allRolls.map((roll) => ({
				timestamp: roll.timestamp,
				type: 'roll' as const,
				rollId: roll.id,
				length: roll.length
			})),
			...allCuts.map((cut) => ({
				timestamp: cut.timestamp,
				type: 'cut' as const,
				rollId: cut.rollId,
				length: cut.length
			}))
		].sort((a, b) => {
			// First sort by timestamp
			if (a.timestamp !== b.timestamp) {
				return a.timestamp - b.timestamp;
			}
			// If timestamps are equal, process rolls before cuts
			if (a.type !== b.type) {
				return a.type === 'roll' ? -1 : 1;
			}
			// If both are the same type, maintain stable order
			return 0;
		});

		// Process events chronologically, but use status page logic for final calculation
		events.forEach((event) => {
			// Calculate total stock using status page logic (total cuts, not chronological)
			const currentStock = (() => {
				const statusPageRolls = new Map<string, number>();

				// Get all rolls up to this point in time
				const rollsUpToNow = allRolls.filter((roll) => roll.timestamp <= event.timestamp);
				rollsUpToNow.forEach((roll) => {
					statusPageRolls.set(roll.id, roll.length);
				});

				// Get all cuts up to this point in time
				const cutsUpToNow = allCuts.filter((cut) => cut.timestamp <= event.timestamp);

				// Calculate total cuts for each roll
				const totalCutsByRoll = new Map<string, number>();
				cutsUpToNow.forEach((cut) => {
					const current = totalCutsByRoll.get(cut.rollId) || 0;
					totalCutsByRoll.set(cut.rollId, current + cut.length);
				});

				// Apply total cuts using status page logic
				totalCutsByRoll.forEach((totalCut, rollId) => {
					const originalLength = statusPageRolls.get(rollId) || 0;
					const remaining = originalLength - totalCut;
					if (remaining > minRollSize) {
						statusPageRolls.set(rollId, remaining);
					} else {
						statusPageRolls.delete(rollId);
					}
				});

				// Sum only rolls with remaining length > minRollSize
				return Array.from(statusPageRolls.values())
					.filter((remaining) => remaining > minRollSize)
					.reduce((sum, remaining) => sum + remaining, 0);
			})();

			data.push({ x: event.timestamp, y: currentStock });
		});

		return data;
	})();

	$: maxLength = allData.reduce((accum, currentItem) => {
		if (currentItem.y > accum) {
			accum = currentItem.y;
		}
		return accum;
	}, 0);

	$: data = {
		datasets: [
			{
				data: allData
			}
		]
	};

	$: options = {
		plugins: {
			legend: {
				display: false
			},
			title: {
				text: 'Yards in stock',
				display: true
			},
			tooltip: {
				callbacks: {
					label: function (context: any) {
						return Number(context.parsed.y).toFixed(1) + ' yards';
					}
				}
			}
		},
		radius: 0,
		borderColor: lineColor,

		maintainAspectRatio: false,
		responsive: true,
		scales: {
			x: {
				type: 'time' as const,
				adapters: {
					date: {
						locale: enUS
					}
				},
				min: minTimestamp,
				max: new Date().getTime(),
				grid: {
					display: false
				}
			},
			y: {
				min: 0,
				max: maxLength
			}
		}
	};

	$: stylesColoursOptions = {
		plugins: {
			legend: {
				display: false
			},
			title: {
				text: 'Yards in stock',
				display: false
			},
			tooltip: {
				callbacks: {
					label: function (context: any) {
						return Number(context.parsed.y).toFixed(1) + ' yards';
					}
				}
			}
		},
		radius: 0,
		borderColor: lineColor,

		maintainAspectRatio: false,
		responsive: true,
		scales: {
			x: {
				type: 'time' as const,
				adapters: {
					date: {
						locale: enUS
					}
				},
				min: minTimestamp,
				max: new Date().getTime(),
				grid: {
					display: false
				},
				display: false
			},
			y: {
				min: 0,
				max: maxSCLength
			}
		}
	};

	$: groupedStylesColoursRolls = Object.groupBy(
		stylesColoursRolls,
		({ styleColourId }) => styleColourId
	);
	$: groupedStylesColoursCuts = Object.groupBy(
		stylesColoursCuts,
		({ styleColourId }) => styleColourId
	);

	$: stylesColoursData = Object.entries(groupedStylesColoursRolls).map(([id, rolls]) => {
		// Calculate stock levels for this specific style/colour
		// KEY CHANGE: Using the same status page logic for consistency
		const stockData = (() => {
			const data: TData[] = [];

			// Sort all events chronologically for this style/colour
			const events = [
				...(rolls?.map((roll) => ({
					timestamp: roll.timestamp,
					type: 'roll' as const,
					rollId: roll.id,
					length: roll.length
				})) || []),
				...(groupedStylesColoursCuts?.[id] || []).map((cut) => ({
					timestamp: cut.timestamp,
					type: 'cut' as const,
					rollId: cut.rollId,
					length: cut.length
				}))
			].sort((a, b) => {
				// First sort by timestamp
				if (a.timestamp !== b.timestamp) {
					return a.timestamp - b.timestamp;
				}
				// If timestamps are equal, process rolls before cuts
				if (a.type !== b.type) {
					return a.type === 'roll' ? -1 : 1;
				}
				// If both are the same type, maintain stable order
				return 0;
			});

			// Process events chronologically, but use status page logic for final calculation
			events.forEach((event) => {
				// Calculate total stock for this style/colour using status page logic
				const totalStock = (() => {
					const statusPageRolls = new Map<string, number>();

					// Get all rolls for this style/colour up to this point in time
					const rollsUpToNow = (rolls || []).filter((roll) => roll.timestamp <= event.timestamp);
					rollsUpToNow.forEach((roll) => {
						statusPageRolls.set(roll.id, roll.length);
					});

					// Get all cuts for this style/colour up to this point in time
					const cutsUpToNow = (groupedStylesColoursCuts?.[id] || []).filter(
						(cut) => cut.timestamp <= event.timestamp
					);

					// Calculate total cuts for each roll
					const totalCutsByRoll = new Map<string, number>();
					cutsUpToNow.forEach((cut) => {
						const current = totalCutsByRoll.get(cut.rollId) || 0;
						totalCutsByRoll.set(cut.rollId, current + cut.length);
					});

					// Apply total cuts using status page logic
					totalCutsByRoll.forEach((totalCut, rollId) => {
						const originalLength = statusPageRolls.get(rollId) || 0;
						const remaining = originalLength - totalCut;
						if (remaining > minRollSize) {
							statusPageRolls.set(rollId, remaining);
						} else {
							statusPageRolls.delete(rollId);
						}
					});

					// Sum only rolls with remaining length > minRollSize
					return Array.from(statusPageRolls.values())
						.filter((remaining) => remaining > minRollSize)
						.reduce((sum, remaining) => sum + remaining, 0);
				})();

				data.push({ x: event.timestamp, y: totalStock });
			});

			return data;
		})();

		return {
			data: {
				datasets: [
					{
						data: stockData
					}
				]
			},
			meta: {
				swatchUrl: rolls?.[0].swatchUrl ?? '',
				colour: rolls?.[0].colour ?? '',
				style: rolls?.[0].style ?? '',
				styleColourId: rolls?.[0].styleColourId ?? ''
			}
		};
	});

	$: maxSCLength = stylesColoursData.reduce((accum, currentItem) => {
		const d = currentItem.data.datasets[0].data;

		const max =
			d?.reduce((innerAccum, innerCurrentItem) => {
				if (innerCurrentItem.y > innerAccum) {
					innerAccum = innerCurrentItem.y;
				}
				return innerAccum;
			}, 0) ?? 0;
		if (max > accum) {
			accum = max;
		}
		return accum;
	}, 0);

	let sortedStylesColours: { data: { datasets: { data: TData[] }[] }; meta: TMeta }[] = [];

	$: sortedStylesColours = stylesColoursData.sort((a, b) => {
		const aName = `${a.meta.style} ${a.meta.colour}`;
		const bName = `${b.meta.style} ${b.meta.colour}`;
		return aName.localeCompare(bName);
	});
</script>

<div class="charts">
	<div>All Styles and Colors</div>
	<div class="mainChartWrapper">
		{#if allRolls}<ChartLine {data} {options} />{/if}
	</div>

	{#each sortedStylesColours as styleColour}
		<div>
			<a href={`/stylecolour/${styleColour.meta.styleColourId}`} class="swatch">
				<Swatch src={styleColour.meta.swatchUrl} />
			</a>
			{`${styleColour.meta.style} ${styleColour.meta.colour}`}
		</div>
		<div class="chartWrapper">
			<ChartLine data={styleColour.data} options={stylesColoursOptions} />
		</div>
	{/each}
</div>

<style>
	.charts {
		display: grid;
		grid-template-columns: 1fr 10fr;
		align-items: center;
		gap: 2vw;
	}

	.mainChartWrapper {
		height: 20vw;
		width: 100%;
	}

	.chartWrapper {
		position: relative;
		height: 10vw;
		width: 100%;
		display: inline-block;
	}

	@media (max-width: 960px) {
		.mainChartWrapper {
			height: 30vw;
			width: 100%;
		}

		.chartWrapper {
			position: relative;
			height: 30vw;
			width: 100%;
			display: inline-block;
		}
	}

	.swatch {
		margin-bottom: 0.5vw;
		display: block;
	}
</style>
