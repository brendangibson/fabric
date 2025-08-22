<script lang="ts">
	import Summary from '$lib/Summary.svelte';
	import type { TStyleColour } from '$src/fabric';

	export let data: {
		stylesColours: TStyleColour[];
	};
</script>

<Summary stylesColours={data?.stylesColours} />
