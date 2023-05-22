<script lang="ts">
	import Header from '$lib/Header.svelte';
	import { setContext } from 'svelte';

	export let data;

	$: setContext('isTrade', data?.user?.level === 'trade');
	$: setContext('username', data?.user?.username ?? data?.user?.email);
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
