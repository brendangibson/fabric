<script lang="ts">
	import { Button } from 'carbon-components-svelte';
	import type { TStyleColour } from '../fabric';
	import AddHold from './AddHold.svelte';
	import { format } from 'date-fns';
	import { humanize } from '../dataFunctions/cuts';
	import Swatch from './Swatch.svelte';

	export let styleColour: TStyleColour;

	let holdModalOpen = false;

	$: sortedIncoming =
		styleColour.incoming?.sort(
			(a, b) => new Date(a.expected).getTime() - new Date(b.expected).getTime()
		) ?? [];
</script>

<div class="row">
	<div class="leftColumn">
		<a
			href={'https://www.sienandco.com/products/' +
				styleColour.style?.toLowerCase() +
				styleColour.colour?.toLowerCase() +
				'-fabric'}
			target="_blank"
		>
			<Swatch src={styleColour.swatchUrl} />
		</a>
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

	.leftColumn {
		width: 33vw;
		padding: 1vw;
	}

	.rightColumn {
		padding: 1vw 5vw;
		width: 67vw;
	}

	.holdModal {
		position: absolute;
		background: #fff;
		padding: 8;
		border: 1px solid grey;
	}
</style>
