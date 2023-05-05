<script lang="ts">
	import { getContext } from 'svelte';

	$: isTrade = getContext('isTrade');
</script>

{#if !isTrade}
	<slot />
{:else}
	<slot name="else" />
{/if}
