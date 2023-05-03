<script lang="ts">
	import StylesColours from '$lib/StylesColours.svelte';

	export let data;

	console.log('data: ', data);
</script>

<StylesColours stylesColours={data?.stylesColours} />
