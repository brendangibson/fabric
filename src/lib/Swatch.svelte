<script lang="ts">
	export let src;
</script>

<div style={`background-image: url(${src})`} />

<style>
	div {
		box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.5);
		width: 100%;
		padding-bottom: 100%;
		background-size: contain;
	}
</style>
