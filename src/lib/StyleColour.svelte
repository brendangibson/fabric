<script lang="ts">
	import { humanize } from '../dataFunctions/cuts';
	import { calculateRemaining } from '../dataFunctions/rolls';
	import type { TShipment, TStyleColour } from '../fabric';
	import RollIcon from './RollIcon.svelte';
	import Swatch from './Swatch.svelte';
	import Incoming from './Incoming.svelte';
	import AccessControl from './AccessControl.svelte';
	import AddIncoming from './AddIncoming.svelte';
	import AddStandby from './AddStandby.svelte';
	import AddHold from './AddHold.svelte';
	import AddRoll from './AddRoll.svelte';
	import Hold from './Hold.svelte';
	import Standby from './Standby.svelte';

	export let styleColour: TStyleColour;
	export let shipments: TShipment[];

	$: bigRolls = [
		...(styleColour?.rolls?.filter((roll) => !roll.returned && calculateRemaining(roll) > 0.5) ??
			[])
	];

	$: smallRolls = [
		...(styleColour?.rolls?.filter((roll) => !roll.returned && calculateRemaining(roll) <= 0.5) ??
			[])
	];

	$: sortedIncoming = [
		...(styleColour.incoming
			? styleColour.incoming.sort(
					(a, b) => new Date(a.expected).getTime() - new Date(b.expected).getTime()
			  )
			: [])
	];
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

	{#if bigRolls}
		{#each bigRolls as roll}
			<a href={`/roll/${roll.id}`} class="rollLink" class:returned={roll.returned}>
				<RollIcon
					originalLength={roll.originalLength ?? 0}
					swatchUrl={styleColour.swatchUrl ?? ''}
					glenRavenId={roll.glenRavenId ?? ''}
					remaining={calculateRemaining(roll)}
				/>
			</a>
		{/each}
		<div class="spacer" />
	{/if}

	{#if sortedIncoming?.length}
		<h3>Incoming Fabric</h3>

		{#each sortedIncoming as incoming}
			<Incoming {incoming} />
		{/each}
		<div class="spacer" />
	{/if}

	<AccessControl>
		<AddIncoming styleColourId={styleColour.id} />
		<div class="spacer" />
	</AccessControl>

	{#if styleColour.standby?.length}
		<h3>Fabric on Standby</h3>

		{#each styleColour.standby as standby}
			<Standby {standby} styleColourId={styleColour.id} />
		{/each}
		<div class="spacer" />
	{/if}

	<AccessControl>
		<AddStandby styleColourId={styleColour.id} />
		<div class="spacer" />
	</AccessControl>

	{#if styleColour.holds?.length}
		<h3>Reserved Fabric</h3>

		{#each styleColour.holds as hold}
			<Hold {hold} styleColourId={styleColour.id} {styleColour} />
		{/each}
		<div class="spacer" />
	{/if}

	<AccessControl>
		<AddHold styleColourId={styleColour.id} />
		<div class="spacer" />
	</AccessControl>

	<AccessControl>
		<AddRoll styleColourId={styleColour.id} {shipments} />
		<div class="spacer" />
	</AccessControl>

	{#if smallRolls}
		<div style="height: 3vh" />
		<h3>Old Rolls</h3>
		{#each smallRolls as roll}
			<a href={`/roll/${roll.id}`} class="rollLink" class:returned={roll.returned}>
				<RollIcon
					originalLength={roll.originalLength ?? 0}
					swatchUrl={styleColour.swatchUrl ?? ''}
					glenRavenId={roll.glenRavenId ?? ''}
					remaining={calculateRemaining(roll)}
				/>
			</a>
		{/each}
	{/if}
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

	.rollLink {
		display: block;
	}

	.rollLink.returned {
		opacity: 0.25;
	}

	.spacer {
		height: 3vh;
	}
</style>
