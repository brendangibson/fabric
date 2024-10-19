<script lang="ts">
	export let errorMsg: string | null;
</script>

{#if errorMsg}
	<div>
		{errorMsg}
	</div>
{/if}

<style>
	div {
		color: red;
	}
</style>
