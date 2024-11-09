<script lang="ts">
	import Charts from '$lib/Charts.svelte';

	export let data: {
		allCuts: { timestamp: number; length: number }[];
		stylesColours: {
			timestamp: number;
			length: number;
			colour: string;
			style: string;
			styleColourId: string;
			swatchUrl: string;
		}[];
	};
</script>

<Charts allCuts={data?.allCuts} stylesColours={data?.stylesColours} />
