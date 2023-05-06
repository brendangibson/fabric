<script lang="ts">
	import { Popover } from 'carbon-components-svelte';
	import DimensionIcon from './DimensionIcon.svelte';

	export let weight: number, length: number, thickness: number;

	let open = false;

	const coreRadius = 1.25;

	const diameter = 2 * Math.sqrt((length * 36 * thickness) / Math.PI + coreRadius * coreRadius);
</script>

<div class="dimensionsWrapper">
	<button on:click={() => (open = !open)}>ⓘ</button>
	<Popover bind:open on:click:outside={() => (open = false)}>
		<div class="dimensions">
			<DimensionIcon {length} {diameter} weight={length * weight} />
		</div>
	</Popover>
</div>

<style>
	.dimensionsWrapper {
		position: relative;
	}

	.dimensions {
		padding: 10%;
		height: 150px;
		min-width: 60vw;
	}
</style>
