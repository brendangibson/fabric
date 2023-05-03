<script lang="ts">
	import { humanize } from '../dataFunctions/cuts';
	import type { TStyleColour } from '../fabric';
	import Swatch from './Swatch.svelte';

	export let styleColour: TStyleColour;
</script>

<div>
	<div class="top">
		<Swatch src={styleColour.swatchUrl} />
		<div class="labelWrapper">
			<div class="label">{styleColour.style} {styleColour.colour}</div>
			<div>
				{humanize(styleColour.remaining ?? 0)} yard{styleColour.remaining === 1 ? '' : 's'}
			</div>
			{#if styleColour.holdsLength && styleColour.holdsLength > 0}
				<div class="hold">
					{humanize(styleColour.holdsLength)} yard{styleColour.holdsLength === 1 ? '' : 's'}{' '}
					on hold
				</div>
			{/if}
			{#if styleColour.incomingLength}
				<div class="incoming">
					{humanize(styleColour.incomingLength)} yard
					{styleColour.incomingLength === 1 ? ' on its way' : 's on their way'}
				</div>
			{/if}
			{#if styleColour.standbyLength}
				<div class="incoming">
					{humanize(styleColour.standbyLength)} yard
					{styleColour.standbyLength === 1 ? ' on standby' : 's on standby'}
				</div>
			{/if}
			{#if styleColour.glenRavenName}
				<i>
					{styleColour.glenRavenName}
				</i>
			{/if}
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

	.hold {
		color: var(--hold);
	}

	.incoming {
		color: var(--incoming);
	}

	i {
		font-size: smaller;
	}
</style>
