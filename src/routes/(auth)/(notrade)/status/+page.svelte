<script lang="ts">
	import Status from '$lib/Status.svelte';
	import type { TStyleColour } from '../../../../fabric';

	export let data: {
		stylesColours: TStyleColour[];
	};
</script>

<Status stylesColours={data?.stylesColours} />
