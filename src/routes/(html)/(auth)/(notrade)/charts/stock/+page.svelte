<script lang="ts">
	import StockCharts from '$lib/StockCharts.svelte';

	export let data: {
		allCuts: { timestamp: number; length: number }[];
		allRolls: { timestamp: number; length: number }[];
		stylesColoursCuts: {
			timestamp: number;
			length: number;
			colour: string;
			style: string;
			styleColourId: string;
			swatchUrl: string;
		}[];
		stylesColoursRolls: {
			timestamp: number;
			length: number;
			colour: string;
			style: string;
			styleColourId: string;
			swatchUrl: string;
		}[];
	};
</script>

<StockCharts
	allCuts={data?.allCuts}
	allRolls={data?.allRolls}
	stylesColoursRolls={data?.stylesColoursRolls}
	stylesColoursCuts={data?.stylesColoursCuts}
/>
