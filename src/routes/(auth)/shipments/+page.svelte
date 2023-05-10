<script lang="ts">
	import Shipments from '$lib/Shipments.svelte';
	import type { TShipment } from '../../../fabric';

	export let data: {
		shipments?: TShipment[];
	};
</script>

{#if data?.shipments}
	<Shipments shipments={data?.shipments} />
{/if}
