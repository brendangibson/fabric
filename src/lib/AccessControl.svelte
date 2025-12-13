<script lang="ts">
	import { SignedIn, useClerkContext } from 'svelte-clerk/client';

	const ctx = useClerkContext();
</script>

<SignedIn>
	{#if ctx.auth.orgRole === 'org:admin'}
		<slot />
	{:else}
		<slot name="else" />
	{/if}
</SignedIn>
