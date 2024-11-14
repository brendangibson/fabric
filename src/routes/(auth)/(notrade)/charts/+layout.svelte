<script lang="ts">
	import { goto } from '$app/navigation';
	import { Tabs, Tab, TabContent } from 'carbon-components-svelte';
</script>

<h1>Charts</h1>

<Tabs>
	<Tab label="Cuts" on:click={() => goto('/charts')} />
	<Tab label="Stock" on:click={() => goto('/charts/stock')} />
	<svelte:fragment slot="content">
		<TabContent><slot /></TabContent>
	</svelte:fragment>
</Tabs>
