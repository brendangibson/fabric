<script lang="ts">
	import Header from '$lib/Header.svelte';
	import { setContext } from 'svelte';

	export let data;

	$: setContext('isTrade', data?.session?.user?.groups?.includes('trade'));
	$: setContext('username', data?.session?.user?.username);
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
