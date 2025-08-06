<script lang="ts">
	import SignIn from 'clerk-sveltekit/client/SignIn.svelte';
</script>

<div>
	<SignIn
		redirectUrl="/"
		appearance={{
			variables: {
				colorPrimary: '#4c4c4c'
			}
		}}
	/>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100vw;
		height: 100vh;
	}

	:global(.cl-headerSubtitle) {
		text-align: center;
	}

	:global(.cl-footer) {
		display: none;
	}
</style>
