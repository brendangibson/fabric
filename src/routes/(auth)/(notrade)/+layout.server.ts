import { redirect } from '@sveltejs/kit';
import type { TSession } from '../../../app';

export const load = async ({ locals, url }) => {
	// Get the session from the locals
	const session = (await locals?.getSession()) as TSession | null;

	if (session?.user?.groups?.includes('trade')) throw redirect(307, '/summary');

	return {
		session
	};
};
