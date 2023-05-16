<script lang="ts">
	import { clickOutside } from '../use/clickOutside';
	import DimensionIcon from './DimensionIcon.svelte';

	export let weight: number, length: number, thickness: number;

	let open = false;

	const coreRadius = 1.25;

	const diameter = 2 * Math.sqrt((length * 36 * thickness) / Math.PI + 2 * coreRadius);
</script>

<div class="dimensionsWrapper">
	<button on:click|preventDefault={() => (open = !open)}>ⓘ</button>
	{#if open}
		<div class="popover" use:clickOutside on:outclick={() => (open = false)}>
			<div class="dimensions">
				<DimensionIcon {diameter} weight={length * weight} />
			</div>
		</div>
	{/if}
</div>

<style>
	.dimensionsWrapper {
		position: relative;
	}

	.dimensions {
		height: 11vw;
		box-sizing: content-box;
	}

	.popover {
		position: absolute;
		bottom: 100%;
		left: 0;
		background-color: var(--white);
		border: 1px solid grey;
		padding: 3vh 3vw;
		width: 40vw;
	}
</style>
