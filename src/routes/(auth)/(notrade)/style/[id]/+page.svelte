<script lang="ts">
	import StyleColours from '$lib/StyleColours.svelte';
	import type { TStyleColour } from '../../../../../fabric';

	export let data: {
		styleColours: TStyleColour[];
		styleColour: string;
	};
</script>

<StyleColours stylesColours={data?.styleColours} styleColour={data?.styleColour} />
