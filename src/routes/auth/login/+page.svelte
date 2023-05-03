<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

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
			console.error('error: ', error);
			errorMsg = error as string;
			await invalidateAll();
		} finally {
			fetching = false;
		}
	};
</script>

<h1>Login</h1>
<div>
	<form name="login" method="POST" on:submit|preventDefault={handleSubmit}>
		<input name="email" type="text" placeholder="Username" />
		<input name="password" placeholder="Password" type="password" />
		<button disabled={fetching}>Sign In</button>
	</form>
</div>
<div class="error">{errorMsg}</div>

<style>
	.error {
		color: var(--error);
	}
</style>
