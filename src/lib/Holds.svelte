<script lang="ts">
	import type { THold } from '../fabric';
	import Hold from './Hold.svelte';

	export let holds: THold[];
</script>

<div class="holds">
	<h1>My Reserves</h1>

	{#if holds && holds.length}
		{#each holds as hold}
			{#if hold.styleColour}
				<Hold {hold} styleColour={hold.styleColour} styleColourId={hold.styleColour?.id} />
			{/if}
		{/each}
	{:else}
		<p>You have not reserved any fabric</p>
	{/if}
</div>

<style>
	.holds {
		display: flex;
		flex-direction: column;
	}
</style>
