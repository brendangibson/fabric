<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ChartConfiguration, Chart } from 'chart.js';
	import {
		Chart as ChartJS,
		BarController,
		LineController,
		BarElement,
		LineElement,
		PointElement,
		LinearScale,
		TimeScale,
		TimeSeriesScale,
		Title,
		Tooltip,
		Legend
	} from 'chart.js';
	import 'chartjs-adapter-date-fns';

	// Register required controllers and elements
	ChartJS.register(
		BarController,
		LineController,
		BarElement,
		LineElement,
		PointElement,
		LinearScale,
		TimeScale,
		TimeSeriesScale,
		Title,
		Tooltip,
		Legend
	);

	type ChartTypeValue = 'bar' | 'line';

	export let type: ChartTypeValue = 'bar';
	export let data: ChartConfiguration<ChartTypeValue>['data'];
	export let options: ChartConfiguration<ChartTypeValue>['options'];

	let canvasElement: HTMLCanvasElement;
	let chartInstance: Chart | null = null;

	function createChart() {
		if (canvasElement && data && !chartInstance) {
			chartInstance = new ChartJS(canvasElement, {
				type,
				data: data as any,
				options: options as any
			});
		}
	}

	function destroyChart() {
		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}
	}

	function updateChart() {
		if (chartInstance && data) {
			chartInstance.data = data;
			if (options) {
				Object.assign(chartInstance.options, options);
			}
			chartInstance.update();
		}
	}

	onMount(() => {
		createChart();
		return destroyChart;
	});

	onDestroy(() => {
		destroyChart();
	});

	// Update chart when data or options change (only after mount)
	$: if (chartInstance && data) {
		updateChart();
	}
</script>

<canvas bind:this={canvasElement}></canvas>

<style>
	canvas {
		max-width: 100%;
		height: 100%;
	}
</style>
