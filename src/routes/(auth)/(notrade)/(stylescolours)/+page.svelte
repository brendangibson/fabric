<script lang="ts">
	import StylesColours from '$lib/StylesColours.svelte';
	import type { TStyleColour } from '../../../../fabric';

	export let data: {
		stylesColours: TStyleColour[];
	};
</script>

<StylesColours stylesColours={data?.stylesColours} />
