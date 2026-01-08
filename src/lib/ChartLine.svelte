<script lang="ts">
	import ChartBar from './ChartBar.svelte';
	import type { ChartConfiguration } from 'chart.js';

	export let data: ChartConfiguration<'line'>['data'];
	export let options: ChartConfiguration<'line'>['options'];

	// Re-export ChartBar with type='line' as ChartLine
</script>

<ChartBar type="line" {data} {options} />
