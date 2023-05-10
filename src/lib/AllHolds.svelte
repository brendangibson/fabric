<script lang="ts">
	import type { THold } from '../fabric';
	import Hold from './Hold.svelte';

	export let holds: THold[];

	$: pendingHolds = [...holds.filter((hold) => hold.pending)];
	$: approvedHolds = [...holds.filter((hold) => !hold.pending)];
</script>

<div class="allHolds">
	<h1>All Reserves</h1>

	<div>
		{#if holds.length === 0}
			<p>No fabric currently reserved</p>
		{:else}
			<h3>Pending</h3>
			{#if pendingHolds}
				{#each pendingHolds as hold}
					<div>
						<img
							src={hold.styleColour?.swatchUrl}
							height="64"
							width="64"
							alt={hold.styleColour?.style + ' ' + hold.styleColour?.colour}
						/>
						{hold.styleColour?.style}
						{hold.styleColour?.colour}
						{#if hold.styleColour}
							<Hold {hold} styleColour={hold.styleColour} styleColourId={hold.styleColour?.id} />
						{/if}
					</div>
				{/each}
			{:else}
				<p>No fabric reserves curently pending</p>
			{/if}
			<h3>Approved</h3>

			{#if approvedHolds}
				{#each approvedHolds as hold}
					<div>
						<img
							src={hold.styleColour?.swatchUrl}
							height="64"
							width="64"
							alt={hold.styleColour?.style + ' ' + hold.styleColour?.colour}
						/>{' '}
						{hold.styleColour?.style}
						{hold.styleColour?.colour}
						{#if hold.styleColour}
							<Hold {hold} styleColour={hold.styleColour} styleColourId={hold.styleColour?.id} />
						{/if}
					</div>
				{/each}
			{:else}
				<p>No fabric reserves curently approved</p>
			{/if}
		{/if}
	</div>
</div>

<style>
	.allHolds {
		display: flex;
		flex-direction: column;
		padding: 5vw 0;
	}
</style>
