<script lang="ts">
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
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
</script>

<SignedIn let:user>
	<AddHold
		{styleColourId}
		{hold}
		{onCancel}
		{onSuccess}
		username={user?.username ?? user?.firstName ?? ''}
	/>
</SignedIn>
