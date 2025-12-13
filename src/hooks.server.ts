/**
 * @file src/hooks.service.ts
 * File containing the hooks service
 */
import { sequence } from '@sveltejs/kit/hooks';
import { createPool } from '@vercel/postgres';
import { POSTGRES_URL } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

import { withClerkHandler } from 'svelte-clerk/server';

const dbHandler: Handle = async ({ event, resolve }) => {
	event.locals.db = createPool({ connectionString: POSTGRES_URL });
	const response = await resolve(event);
	return response;
};

const handleSignOut: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/sign-out')) {
		return new Response('Redirect', { status: 303, headers: { Location: '/' } });
	}
	return resolve(event);
};

const publicPaths = ['/sign-in', '/public', '/api/mcp'];

const handleProtectedPaths: Handle = async ({ event, resolve }) => {
	const isPublicPath = publicPaths.some((path) => event.url.pathname.startsWith(path));
	
	// Transform svelte-clerk auth to session format for compatibility
	if (event.locals.auth) {
		const auth = event.locals.auth();
		if (auth?.userId) {
			event.locals.session = {
				userId: auth.userId,
				claims: {
					org_role: (auth.sessionClaims?.org_role as string) || ''
				}
			};
		}
	}
	
	// Only protect non-public paths
	if (!isPublicPath) {
		const auth = event.locals.auth?.();
		if (!auth?.userId) {
			return new Response('Redirect', {
				status: 307,
				headers: { Location: '/sign-in' }
			});
		}
	}
	
	return resolve(event);
};

export const handle = sequence(
	dbHandler,
	withClerkHandler({
		debug: true
	}),
	handleProtectedPaths,
	handleSignOut
);
