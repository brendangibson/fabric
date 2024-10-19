<script lang="ts">
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
</script>

<SignedIn let:user>
	{#if user?.organizationMemberships?.[0]?.role === 'org:admin'}
		<slot />
	{:else}
		<slot name="else" />
	{/if}
</SignedIn>
