<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

	console.log('$page: ', $page);
</script>

<div>
	<header>
		{#if $page.data.session}
			<div>
				<strong>Hello {$page.data.session.user?.email}</strong>
				<button on:click|preventDefault={signOut} class="button">Sign out</button>
			</div>
		{:else}
			<a href="/auth/login" class="buttonPrimary">Sign in</a>
		{/if}
	</header>
	<slot />
</div>
