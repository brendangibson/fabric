<script lang="ts">
	import type { TStyleColour } from '../app';
	import Swatch from './Swatch.svelte';

	export let styleColour: TStyleColour;
</script>

<div>
	<div class="top">
		<Swatch src={styleColour.swatchUrl} />
		<div class="labelWrapper">
			<div class="label">{styleColour.style} {styleColour.colour}</div>
		</div>
	</div>
</div>

<style>
	.top {
		padding: 5vw 0 5vw 0;
		display: grid;
		grid-template-columns: 50% auto;
		grid-gap: 5vw;
	}

	.labelWrapper {
		display: inline-block;
	}

	.label {
		font-size: 6vw;
		display: inline-block;
		vertical-align: top;
	}
</style>
