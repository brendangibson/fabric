<script lang="ts">
	import type { THold } from '../fabric';
	import Hold from './Hold.svelte';

	export let holds: THold[];
</script>

<div class="holds">
	<h1>My Reserves</h1>

	<div>
		{#if holds}
			{#each holds as hold}
				{#if hold.styleColour}
					<Hold {hold} styleColour={hold.styleColour} styleColourId={hold.styleColour?.id} />
				{/if}
			{/each}
		{/if}
	</div>
</div>

<style>
	.holds {
		display: flex;
		flex-direction: column;
		padding: 5vw 0;
	}
</style>
