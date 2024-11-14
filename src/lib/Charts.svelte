<script lang="ts">
	import Swatch from './Swatch.svelte';
	import { Bar } from 'svelte-chartjs';
	import { ContentSwitcher, Switch } from 'carbon-components-svelte';
	import {
		Chart,
		Title,
		Tooltip,
		Legend,
		BarElement,
		LinearScale,
		TimeScale,
		TimeSeriesScale
	} from 'chart.js';
	import 'chartjs-adapter-date-fns';
	import { enUS } from 'date-fns/locale';
	import TrendlineLinearPlugin from 'chartjs-plugin-trendline';

	Chart.register(
		Title,
		Tooltip,
		Legend,
		BarElement,
		LinearScale,
		TimeScale,
		TimeSeriesScale,
		TrendlineLinearPlugin
	);
	export let allCuts: { timestamp: number; length: number }[];
	export let stylesColours: {
		timestamp: number;
		length: number;
		colour: string;
		style: string;
		styleColourId: string;
		swatchUrl: string;
	}[];

	const buckets = ['all', 'daily', 'monthly', 'yearly'];
	const backgroundColor = '#b264c178';
	const trendlineColor = '#16f44a99';

	type TMeta = { swatchUrl: string; colour: string; style: string };
	type TData = { x: number; y: number };
	type TStyleColour = Record<string, { data: { datasets: [{ data: TData[] }] }; meta: TMeta }>;

	let minTimestamp = allCuts[0].timestamp;

	let selectedIndex = 0;

	const getBucketDate = (currentItem: { timestamp: number; length: number }) => {
		const year = new Date(currentItem.timestamp).getFullYear();
		const month = new Date(currentItem.timestamp).getMonth();
		const day = new Date(currentItem.timestamp).getDate();
		let newDate: number = 0;

		switch (buckets[selectedIndex]) {
			case 'daily':
				newDate = new Date(year, month, day, 0).getTime();
				break;
			case 'monthly':
				newDate = new Date(year, month, 15, 0).getTime();
				break;
			case 'yearly':
				newDate = new Date(year, 6, 15, 0).getTime();
				break;
		}

		return newDate;
	};

	let allData: TData[] = [];
	$: {
		allData = [];
		switch (buckets[selectedIndex]) {
			case 'daily':
			case 'monthly':
			case 'yearly':
				allData = [
					...allCuts.reduce<TData[]>((accum, currentItem) => {
						let newDate = getBucketDate(currentItem);

						const entry = accum.find((item) => item.x === newDate);
						if (!entry) {
							accum.push({ x: newDate, y: currentItem.length });
						} else {
							entry.y += currentItem.length;
						}

						return accum;
					}, [])
				];
				break;
			default:
				allData = [...allCuts?.map((item) => ({ x: item.timestamp, y: item.length }))];
		}
	}

	$: maxLength = allData.reduce((accum, currentItem) => {
		if (currentItem.y > accum) {
			accum = currentItem.y;
		}
		return accum;
	}, 0);

	$: data = {
		datasets: [
			{
				data: allData,
				trendlineLinear: {
					colorMin: trendlineColor,
					lineStyle: 'dashed',
					width: 1
				}
			}
		]
	};

	$: options = {
		plugins: {
			legend: {
				display: false
			},
			title: {
				text: 'Cut lengths',
				display: true
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						return context.parsed.y + ' yards';
					}
				}
			}
		},

		barThickness:
			buckets[selectedIndex] === 'all' || buckets[selectedIndex] === 'daily' ? 3 : undefined,
		backgroundColor,
		borderWidth: 0,
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

	let styleColourOptions = {
		plugins: {
			legend: {
				display: false
			},

			tooltip: {
				callbacks: {
					label: function (context) {
						return Number(context.parsed.y) + ' yards';
					}
				}
			}
		},

		barThickness:
			buckets[selectedIndex] === 'all' || buckets[selectedIndex] === 'daily' ? 3 : undefined,
		backgroundColor,
		borderWidth: 0,
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
				max: maxLength
			}
		}
	};

	$: stylesColoursData = stylesColours.reduce<TStyleColour>((accum, currentItem) => {
		if (!accum[currentItem.styleColourId]) {
			accum[currentItem.styleColourId] = {
				data: {
					datasets: [
						{
							data: [],
							trendlineLinear: {
								colorMin: trendlineColor,
								lineStyle: 'dashed',
								width: 1
							}
						}
					]
				},
				meta: {
					swatchUrl: currentItem.swatchUrl,
					colour: currentItem.colour,
					style: currentItem.style
				}
			};
		}

		switch (buckets[selectedIndex]) {
			case 'daily':
			case 'monthly':
			case 'yearly':
				let newDate = getBucketDate(currentItem);

				const entry = accum[currentItem.styleColourId].data.datasets[0].data.find(
					(item) => item.x === newDate
				);
				if (!entry) {
					accum[currentItem.styleColourId].data.datasets[0].data.push({
						x: newDate,
						y: currentItem.length
					});
				} else {
					entry.y += currentItem.length;
				}

				break;
			default:
				accum[currentItem.styleColourId].data.datasets[0].data.push({
					x: currentItem.timestamp,
					y: currentItem.length
				});
		}

		return accum;
	}, {});

	let sortedStylesColours: [string, { data: { datasets: [{ data: TData[] }] }; meta: TMeta }][] =
		[];

	$: sortedStylesColours = Object.entries(stylesColoursData).sort((a, b) => {
		const aName = `${a[1].meta.style} ${a[1].meta.colour}`;
		const bName = `${b[1].meta.style} ${b[1].meta.colour}`;
		return aName.localeCompare(bName);
	});
</script>

<ContentSwitcher bind:selectedIndex>
	<Switch text="All" />
	<Switch text="Daily" />
	<Switch text="Monthly" />
	<Switch text="Yearly" />
</ContentSwitcher>
<div class="charts">
	<div>All Styles and Colors</div>
	<div class="mainChartWrapper">
		{#if allCuts}<Bar {data} {options} />{/if}
	</div>
	{#each sortedStylesColours as [styleColourId, styleColour]}
		<div>
			<a href={`/stylecolour/${styleColourId}`} class="swatch">
				<Swatch src={styleColour.meta.swatchUrl} />
			</a>
			{`${styleColour.meta.style} ${styleColour.meta.colour}`}
		</div>
		<div class="chartWrapper">
			<Bar data={styleColour.data} options={styleColourOptions} />
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
