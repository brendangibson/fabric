<script lang="ts">
	import StyleColour from '$lib/StyleColour.svelte';

	export let data;

	console.log('data: ', data);
</script>

<StyleColour styleColour={data?.styleColour?.[0]} />
