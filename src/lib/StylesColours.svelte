<script lang="ts">
	import Swatch from '$lib/Swatch.svelte';
	import type { TStyleColour } from '../fabric';

	export let stylesColours: TStyleColour[];
</script>

<div class="stylesColours">
	{#if stylesColours}
		{#each stylesColours as styleColour}
			<a href={`/stylecolour/${styleColour.id}`}>
				<Swatch src={styleColour.swatchUrl} />
				<span class="label">{styleColour.style} {styleColour.colour}</span>
			</a>
		{/each}
	{/if}
</div>

<style>
	.stylesColours {
		display: flex;
		gap: 6vw;
		padding: 5vw 0;
		flex-wrap: wrap;
	}

	a {
		flex-basis: 17vw;
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	.label {
		margin-top: 1vh;
	}
</style>
