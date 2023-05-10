<script lang="ts">
	import type { TStyleColour } from '../fabric';
	import SummaryStyleColour from './SummaryStyleColour.svelte';

	export let stylesColours: TStyleColour[];
</script>

<div class="summary">
	{#if stylesColours}
		{#each stylesColours as styleColour}
			<SummaryStyleColour {styleColour} />
		{/each}
	{/if}
</div>

<style>
	.summary {
		display: flex;
		flex-direction: column;
		padding: 5vw 0;
	}
</style>
