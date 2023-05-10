<script lang="ts">
	import Summary from '$lib/Summary.svelte';
	import type { TStyleColour } from '../../../fabric';

	export let data: {
		stylesColours: TStyleColour[];
	};
</script>

<Summary stylesColours={data?.stylesColours} />
