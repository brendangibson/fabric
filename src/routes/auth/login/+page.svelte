<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button, TextInput } from 'carbon-components-svelte';
	import Loading from '$lib/Loading.svelte';
	import InlineError from '$lib/InlineError.svelte';

	let errorMsg = '';
	let fetching = false;

	const handleSubmit = async (event: SubmitEvent) => {
		if (!event?.target) {
			errorMsg = 'Submit did not pass event target';
			return;
		}
		const data = new FormData(event.target as HTMLFormElement);
		try {
			fetching = true;
			await signIn('credentials', {
				username: data.get('email'),
				password: data.get('password'),
				callbackUrl: $page.url.searchParams.get('callbackUrl')
			});
		} catch (error) {
			// TODO: this error message is not showing - probably due to reload
			console.error('error signing in: ', error);
			errorMsg = error as string;
			await invalidateAll();
			fetching = false;
		}
	};
</script>

<main>
	{#if fetching}
		<Loading />
	{:else}
		<img src="/textLogo.svg" alt="Sien+Co" />
		<form name="login" method="POST" on:submit|preventDefault={handleSubmit}>
			<TextInput labelText="Username" name="email" type="text" placeholder="username" />
			<TextInput
				labelText="Password"
				name="password"
				placeholder="Upper and lower cases, a special char and a num"
				type="password"
			/>
			<Button type="submit" kind="secondary" disabled={fetching}>Sign In</Button>
		</form>
		<InlineError {errorMsg} />
	{/if}
</main>

<style>
	main {
		transform: translateX(-50%);
		left: 50%;
		position: absolute;
		padding-top: 3vh;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 2vh;
	}
	@media (max-width: 960px) {
		img {
			margin: 3vw;
			width: 80vw;
		}
	}

	@media (min-width: 960px) {
		img {
			margin: 3vw;
			height: 40vh;
		}
	}
</style>
