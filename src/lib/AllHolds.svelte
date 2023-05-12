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
				<div class="holds">
					{#each pendingHolds as hold}
						<div class="hold">
							<div class="title">
								<img
									src={hold.styleColour?.swatchUrl}
									height="64"
									width="64"
									alt={hold.styleColour?.style + ' ' + hold.styleColour?.colour}
								/>
								{hold.styleColour?.style}
								{hold.styleColour?.colour}
							</div>
							{#if hold.styleColour}
								<Hold {hold} styleColour={hold.styleColour} styleColourId={hold.styleColour?.id} />
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p>No fabric reserves curently pending</p>
			{/if}
			<div style="height: 3vh" />
			<h3>Approved</h3>

			{#if approvedHolds}
				<div class="holds">
					{#each approvedHolds as hold}
						<div class="hold">
							<div class="title">
								<img
									src={hold.styleColour?.swatchUrl}
									height="64"
									width="64"
									alt={hold.styleColour?.style + ' ' + hold.styleColour?.colour}
								/>
								{hold.styleColour?.style}
								{hold.styleColour?.colour}
							</div>
							{#if hold.styleColour}
								<Hold {hold} styleColour={hold.styleColour} styleColourId={hold.styleColour?.id} />
							{/if}
						</div>
					{/each}
				</div>
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
	}

	.holds {
		display: flex;
		flex-direction: column;
		gap: 1vh;
	}

	.hold {
		vertical-align: middle;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 1vw;
		margin-bottom: 1vh;
	}
</style>
