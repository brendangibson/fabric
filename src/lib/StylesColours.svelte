<script lang="ts">
	import Swatch from '$lib/Swatch.svelte';

	export let stylesColours;

	$: console.log('stylesColours: ', stylesColours);
</script>

<div class="stylesColours">
	{#if stylesColours}
		{#each stylesColours as styleColour}
			<a href={`/stylecolour/${styleColour.id}`} key={styleColour.id}>
				<Swatch src={styleColour.swatchUrl} />
				<span>{styleColour.style} {styleColour.colour}</span>
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
</style>
