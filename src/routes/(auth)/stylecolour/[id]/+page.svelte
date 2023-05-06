<script lang="ts">
	import StyleColour from '$lib/StyleColour.svelte';
	import { ToastNotification } from 'carbon-components-svelte';
	import type { TShipment, TStyleColour } from '../../../../fabric';

	export let data: {
		styleColour?: TStyleColour;
		shipments?: TShipment[];
		error?: string;
	};
</script>

{#if data?.error}
	<ToastNotification lowContrast kind="error" title="Error" subtitle={data?.error} />
{/if}
{#if data?.styleColour}
	<StyleColour styleColour={data?.styleColour} shipments={data?.shipments ?? []} />
{/if}
