<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button, TextInput } from 'carbon-components-svelte';
	import Loading from '$lib/Loading.svelte';
	import InlineError from '$lib/InlineError.svelte';
	import { onMount } from 'svelte';

	let errorMsg = '';
	let fetching = false;

	const error = $page.url.searchParams.get('error');

	$: {
		if (error) {
			switch(error) {
			case 'CredentialsSignin' :
				errorMsg = 'Username or password not accepted'
				break;
			default:
				errorMsg = 'An error occurred while signing in'
			}
		}
	}

	onMount(async () => {
		// Doing this to ensure it has been generated
		await fetch('/auth/csrf');
	});

	const handleSubmit = async (event: SubmitEvent) => {
		if (!event?.target) {
			errorMsg = 'Submit did not pass event target';
			return;
		}
		errorMsg='';
		const data = new FormData(event.target as HTMLFormElement);
		try {
			fetching = true;
			const signinResult = signIn('credentials', {
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
		<picture>
			<source media="(max-width: 960px)" srcset="/textLogo.svg" width="80vw" />
			<source media="(min-width: 960px)" srcset="/textLogo.svg" height="40vh" />
		</picture>
		<img src="/textLogo.svg" alt="Sien+Co" />
		<form name="login" on:submit|preventDefault={handleSubmit}>
			<TextInput labelText="Username" name="email" type="text" placeholder="username" />
			<TextInput
				labelText="Password"
				name="password"
				placeholder="Upper & lower cases, special char, num"
				type="password"
			/>
			<Button type="submit" kind="secondary" disabled={fetching}>Sign In</Button>
			

			<InlineError {errorMsg} />
		</form>
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
		form {
			width: 80vw;
			margin: 0 3vw 5vh 0;
		}
	}

	@media (min-width: 960px) {
		img {
			margin: 3vw;
			width: 30vw;
		}
		form {
			width: 30vw;
			margin: 0 3vw 5vh 0;
		}
	}
</style>
