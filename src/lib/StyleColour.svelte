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
	import AddHold from './AddHoldWrapper.svelte';
	import AddRoll from './AddRoll.svelte';
	import Hold from './Hold.svelte';
	import Standby from './Standby.svelte';
	import { Tile } from 'carbon-components-svelte';
	import { minRollSize } from '../constants';

	export let styleColour: TStyleColour;
	export let shipments: TShipment[];

	$: bigRolls = [
		...(styleColour?.rolls?.filter(
			(roll) => !roll.returned && calculateRemaining(roll) > minRollSize
		) ?? [])
	];

	$: smallRolls = [
		...(styleColour?.rolls?.filter(
			(roll) => !roll.returned && calculateRemaining(roll) <= minRollSize
		) ?? [])
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
			<div class="lineItem">
				<span class="metric">
					{humanize(styleColour.remaining ?? 0)} yard{styleColour.remaining === 1 ? '' : 's'}</span
				><span class="rest">{' '}in stock</span>
			</div>
			{#if styleColour.holdsLength && styleColour.holdsLength > 0}
				<div class="hold lineItem">
					<span class="metric">
						{humanize(styleColour.holdsLength)} yard{styleColour.holdsLength === 1 ? '' : 's'}</span
					><span class="rest">{' '}on hold</span>
				</div>
			{/if}
			{#if styleColour.incomingLength}
				<div class="incoming lineItem">
					<span class="metric">
						{humanize(styleColour.incomingLength)} yard{styleColour.incomingLength === 1
							? ''
							: 's'}</span
					><span class="rest"
						>{styleColour.incomingLength === 1 ? ' on its way' : ' on their way'}</span
					>
				</div>
			{/if}
			{#if styleColour.standbyLength}
				<div class="standby lineItem">
					<span class="metric">
						{humanize(styleColour.standbyLength)} yard{styleColour.standbyLength === 1
							? ''
							: 's'}</span
					><span class="rest"
						>{styleColour.standbyLength === 1 ? ' on standby' : ' on standby'}</span
					>
				</div>
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

	<div class="lists">
		<h3>Incoming Fabric</h3>

		<Tile>
			{#if sortedIncoming?.length}
				<div class="itemList">
					{#each sortedIncoming as incoming}
						<Incoming {incoming} />
					{/each}
				</div>
				<div class="spacer" />
			{/if}

			<AccessControl>
				<AddIncoming styleColourId={styleColour.id} />
				<div class="spacer" />
			</AccessControl>
		</Tile>
		<h3>Fabric on Standby</h3>

		<Tile>
			{#if styleColour.standby?.length}
				<div class="itemList">
					{#each styleColour.standby as standby}
						<Standby {standby} styleColourId={styleColour.id} />
					{/each}
				</div>
				<div class="spacer" />
			{/if}

			<AccessControl>
				<AddStandby styleColourId={styleColour.id} />
				<div class="spacer" />
			</AccessControl>
		</Tile>
		<h3>Reserved Fabric</h3>
		<Tile>
			{#if styleColour.holds?.length}
				<div class="itemList">
					{#each styleColour.holds.sort((a, b) => new Date(b.expires).getTime() - new Date(a.expires).getTime()) as hold}
						<Hold {hold} styleColourId={styleColour.id} {styleColour} />
					{/each}
				</div>
				<div class="spacer" />
			{/if}

			<AccessControl>
				<AddHold styleColourId={styleColour.id} />
				<div class="spacer" />
			</AccessControl>
		</Tile>
		<Tile>
			<AccessControl>
				<AddRoll styleColourId={styleColour.id} {shipments} />
				<div class="spacer" />
			</AccessControl>
		</Tile>
	</div>

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
	h3 {
		margin-bottom: 0;
	}

	.top {
		padding: 5vw 0 5vw 0;
		display: grid;
		grid-template-columns: 50% auto;
		grid-gap: 5vw;
	}

	@media (min-width: 960px) {
		.top {
			grid-template-columns: 20% auto;
		}
	}

	.labelWrapper {
		display: inline-block;
	}

	.label {
		font-size: 6vw;
		display: inline-block;
		vertical-align: top;
	}

	.lists {
		display: flex;
		flex-direction: column;
		gap: 3vh;
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

	.metric {
		text-decoration: underline;
	}

	.lineItem {
		line-height: 200%;
		display: flex;
		align-items: center;
		white-space: nowrap;
	}
	.rest {
		white-space-collapse: preserve;
	}
</style>
