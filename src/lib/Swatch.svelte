<script lang="ts" context="module">
	export const getUrl = (src: string | undefined) => {
		const match = src?.match(/\/?(\w+)\.\w+$/);
		return `/assets/webp/${match?.[1]}.webp`;
	};
</script>

<script lang="ts">
	export let src: string | undefined;

	const url = getUrl(src);
</script>

<div style={`background-image: url(${url})`} />

<style>
	div {
		box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.5);
		width: 100%;
		padding-bottom: 100%;
		background-size: contain;
	}
</style>
