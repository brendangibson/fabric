<script lang="ts">
	export let data;

	console.log('data: ', data);
</script>

This is a restricted page

{#if data?.colours}
	{#each data?.colours as colour}
		<p key={colour.id}>{colour.name}</p>
	{/each}
{/if}
