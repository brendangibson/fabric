<script lang="ts">
	import Roll from '$lib/Roll.svelte';
	import { ToastNotification } from 'carbon-components-svelte';
	import type { TRoll } from '../$src/fabric';

	export let data: {
		roll?: TRoll;
		error?: string;
	};
</script>

{#if data?.error}
	<ToastNotification lowContrast kind="error" title="Error" subtitle={data?.error} />
{/if}
{#if data?.roll}
	<Roll roll={data?.roll} />
{/if}
