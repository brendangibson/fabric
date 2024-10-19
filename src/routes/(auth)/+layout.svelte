<script lang="ts">
	import Header from '$lib/Header.svelte';
</script>

<main class="fabricApp">
	<Header />
	<slot />
</main>

<style>
	.fabricApp {
		padding: 0 5vw 5vw 5vw;
	}
</style>
