<script lang="ts">
	import { Line } from 'svelte-chartjs';
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
	export let allCuts: { timestamp: number; length: number }[];
	export let allRolls: { timestamp: number; length: number }[];
	export let stylesColoursCuts: {
		timestamp: number;
		length: number;
		colour: string;
		style: string;
		styleColourId: string;
		swatchUrl: string;
	}[];
	export let stylesColoursRolls: {
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

	let minTimestamp = allRolls[0].timestamp;

	$: allChanges = allRolls
		.map((roll) => ({ x: roll.timestamp, y: roll.length }))
		.concat(allCuts.map((cut) => ({ x: cut.timestamp, y: -1 * cut.length })))
		.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

	let allData: TData[] = [];
	$: allData = allChanges.reduce(
		(accum, currentValue) => {
			const lastItem = accum[accum.length - 1];
			if (lastItem.x === currentValue.x) {
				lastItem.y += currentValue.y;
			} else {
				accum.push({ x: currentValue.x, y: lastItem.y + currentValue.y });
			}
			return accum;
		},
		[{ x: minTimestamp, y: 0 }]
	);

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
					label: function (context) {
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
				type: 'time',
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
					label: function (context) {
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
				type: 'time',
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
		const allChanges = rolls
			?.map((roll) => ({ x: roll.timestamp, y: roll.length }))
			.concat(
				groupedStylesColoursCuts?.[id]?.map((cut) => ({ x: cut.timestamp, y: -1 * cut.length })) ??
					[]
			)
			.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

		return {
			data: {
				datasets: [
					{
						data: allChanges?.reduce(
							(accum, currentValue) => {
								const lastItem = accum[accum.length - 1];
								if (lastItem.x === currentValue.x) {
									lastItem.y += currentValue.y;
								} else {
									accum.push({ x: currentValue.x, y: lastItem.y + currentValue.y });
								}
								return accum;
							},
							[{ x: minTimestamp, y: 0 }]
						)
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

	let sortedStylesColours: { data: { datasets: { data: TData[] | undefined }[] }; meta: TMeta }[] =
		[];

	$: sortedStylesColours = stylesColoursData.sort((a, b) => {
		const aName = `${a.meta.style} ${a.meta.colour}`;
		const bName = `${b.meta.style} ${b.meta.colour}`;
		return aName.localeCompare(bName);
	});
</script>

<div class="charts">
	<div>All Styles and Colors</div>
	<div class="mainChartWrapper">
		{#if allRolls}<Line {data} {options} />{/if}
	</div>
	{#each sortedStylesColours as styleColour}
		<div>
			<a href={`/stylecolour/${styleColour.meta.styleColourId}`} class="swatch">
				<Swatch src={styleColour.meta.swatchUrl} />
			</a>
			{`${styleColour.meta.style} ${styleColour.meta.colour}`}
		</div>
		<div class="chartWrapper">
			<Line data={styleColour.data} options={stylesColoursOptions} />
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
