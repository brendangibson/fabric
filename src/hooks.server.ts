/**
 * @file src/hooks.service.ts
 * File containing the hooks service
 */
import { sequence } from '@sveltejs/kit/hooks';
import { createPool } from '@vercel/postgres';
import { POSTGRES_URL } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

import { handleClerk } from 'clerk-sveltekit/server';
import { CLERK_SECRET_KEY } from '$env/static/private';

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

const publicPaths = ['/sign-in', '/public'];

export const handle = sequence(
	dbHandler,
	handleClerk(CLERK_SECRET_KEY, {
		debug: true,
		protectedPaths: [(e) => publicPaths.every((path) => !e.url.pathname.startsWith(path))],
		signInUrl: '/sign-in'
	}),
	handleSignOut
);
