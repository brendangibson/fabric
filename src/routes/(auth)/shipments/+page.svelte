<script lang="ts">
	import Shipments from '$lib/Shipments.svelte';
	import { ToastNotification } from 'carbon-components-svelte';
	import type { TShipment } from '../../../fabric';

	export let data: {
		shipments?: TShipment[];
		error?: string;
	};
</script>

{#if data?.error}
	<ToastNotification lowContrast kind="error" title="Error" subtitle={data?.error} />
{/if}
{#if data?.shipments}
	<Shipments shipments={data?.shipments} />
{/if}
