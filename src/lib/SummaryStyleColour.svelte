<script lang="ts">
	import { Button } from 'carbon-components-svelte';
	import type { TStyleColour } from '../fabric';
	import AddHold from './AddHold.svelte';
	import { format } from 'date-fns';
	import { humanize } from '../dataFunctions/cuts';
	import Swatch from './Swatch.svelte';
	import AccessControl from './AccessControl.svelte';

	export let styleColour: TStyleColour;

	let holdModalOpen = false;

	$: sortedIncoming =
		styleColour.incoming?.sort(
			(a, b) => new Date(a.expected).getTime() - new Date(b.expected).getTime()
		) ?? [];
</script>

<div class="row">
	<div class="leftColumn">
		<AccessControl>
			<a href={`/stylecolour/${styleColour.id}`}>
				<Swatch src={styleColour.swatchUrl} />
			</a>
			<a
				slot="else"
				href={'https://www.sienandco.com/products/' +
					styleColour.style?.toLowerCase() +
					styleColour.colour?.toLowerCase() +
					'-fabric'}
				target="_blank"
			>
				<Swatch src={styleColour.swatchUrl} />
			</a>
		</AccessControl>
	</div>
	<div class="rightColumn">
		<strong>{`${styleColour.style} ${styleColour.colour}`}</strong>
		<div>
			<strong>
				{humanize(styleColour.remaining ?? 0)} yard{styleColour.remaining === 1 ? '' : 's'}
			</strong>
			in stock
		</div>
		{#if styleColour.holdsLength}
			<div style="color: sienna">
				{humanize(styleColour.holdsLength)} yards reserved
			</div>
		{/if}
		{#if sortedIncoming}
			{#each sortedIncoming as incoming}
				<div style="color: #58735F">
					{incoming.length} yards expected
					{incoming.expected ? format(new Date(incoming.expected), 'MM/DD/YY') : ''}
				</div>
			{/each}
		{/if}
		{#if styleColour.incomingLength}
			<div style="color: #58735F">
				{styleColour.incomingLength} yards on their way
			</div>
		{/if}
		{#if styleColour.standby}
			{#each styleColour.standby as standby}
				<div style="color: #58735F">
					{standby.length} yards on standby
				</div>
			{/each}
		{/if}
		{#if styleColour.standbyLength && !styleColour.standby}
			<div style="color: #58735F">
				{styleColour.standbyLength} yards on standby
			</div>
		{/if}
		<Button kind="secondary" on:click={() => (holdModalOpen = true)} style="margin-top: 1vh">
			Request a reserve
		</Button>
		{#if holdModalOpen}
			<div class="holdModal">
				<button class="close" on:click|preventDefault={() => (holdModalOpen = false)}>X</button>
				<AddHold
					styleColourId={styleColour.id}
					onSuccess={() => (holdModalOpen = false)}
					onCancel={() => (holdModalOpen = false)}
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	.row {
		display: flex;
	}
	@media (max-width: 960px) {
		.leftColumn {
			width: 40vw;
			padding: 1vw;
		}
	}
	@media (min-width: 960px) {
		.leftColumn {
			width: 20vw;
			padding: 1vw;
		}
	}

	.rightColumn {
		display: flex;
		flex-direction: column;
		gap: 1vw;
		padding: 1vw 5vw;
		width: 67vw;
	}

	.holdModal {
		position: absolute;
		background: var(--white);
		padding: 3vh;
		border: 1px solid grey;
		z-index: 1;
	}

	.close {
		position: absolute;
		right: 1vw;
		top: 1vw;
		border: none;
		background: transparent;
	}
</style>
