<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	console.log('page: ', $page);

	const handleSubmit = async (event: any) => {
		const data = new FormData(event.target);
		try {
			console.log('signing in');
			const result = await signIn('credentials', {
				username: data.get('email'),
				password: data.get('password'),
				callbackUrl: $page.url.searchParams.get('callbackUrl')
			});
		} catch (error) {
			console.error('error: ', error);
			await invalidateAll();
		}
	};
</script>

<h1>Login</h1>
<div>
	<form name="login" method="POST" on:submit|preventDefault={handleSubmit}>
		<input name="email" type="text" placeholder="Username" />
		<input name="password" placeholder="Password" type="password" />
		<button>Sign In</button>
	</form>
</div>
