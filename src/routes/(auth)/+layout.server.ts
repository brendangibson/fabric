import { redirect } from '@sveltejs/kit';

// import { getAccount } from '$lib/domain/auth/api/getAccount';
export const load = async ({ locals, url }) => {
	// Get the session from the locals
	const session = (await locals?.getSession()) as any;

	// If the user is not authenticated, redirect to the login page
	if (!session?.user?.id || !session?.accessToken) {
		console.log('session not authenticated');
		throw redirect(307, `/auth/login?callbackUrl=${url.pathname}`);
	}
	// Get the account details at the root layout level so that we can use it in the sub layouts
	//   const account = await getAccount(session?.user?.id, session?.accessToken);
	// If the account is not found, redirect to the login page
	//   if (!account) {
	//     throw redirect(307, '/auth/login');
	//   }
	// On success, we can send the session and account data to the sub layouts
	return {
		session
	};
};
