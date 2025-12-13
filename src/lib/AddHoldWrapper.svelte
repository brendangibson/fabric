<script lang="ts">
	import { SignedIn, useClerkContext } from 'svelte-clerk/client';
	import AddHold from './AddHold.svelte';
	import type { THold } from '../fabric';

	export let styleColourId: string;
	export let hold: THold | undefined = undefined;
	export let onCancel = () => {
		/*deliberate*/
	};
	export let onSuccess = () => {
		/*deliberate*/
	};

	const ctx = useClerkContext();
</script>

<SignedIn>
	<AddHold
		{styleColourId}
		{hold}
		{onCancel}
		{onSuccess}
		username={ctx.user?.username ?? ctx.user?.firstName ?? ''}
	/>
</SignedIn>
