import { redirect } from '@sveltejs/kit';
import type { TSession } from '../../app';

// import { getAccount } from '$lib/domain/auth/api/getAccount';
export const load = async ({ locals, url }) => {

	const {db} = locals;
	// Get the session from the locals
	const session = (await locals?.getSession()) as TSession | null;

	// If the user is not authenticated, redirect to the login page
	if (!session?.user?.id || !session?.accessToken) {
		console.error('no id or access token found: ', session)
		throw redirect(307, `/auth/login?callbackUrl=${url.pathname}`);
	}
	// Get the account details at the root layout level so that we can use it in the sub layouts
	if (!session.user) {
		console.error('no matching user found: ', session)
		throw redirect(307, `/auth/login?callbackUrl=${url.pathname}&error=CredentialsSignin`);
	}

	// On success, we can send the session and account data to the sub layouts
	return {
		session,
		user: session.user
	};
};
