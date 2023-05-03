// See https://kit.svelte.dev/docs/types#app

import type { User } from '@auth/core/types';
import type { VercelPool } from '@vercel/postgres';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: VercelPool;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

type AuthUser = {
	id: string;
	email: string;
	accessToken: string;
	accessTokenExpires: number;
	refreshToken: string;
};

type TSession = {
	user: User;
	accessToken: string;
	error: string;
};

type TStyleColour = {
	id: string;
	swatchUrl?: string;
	colour?: string;
	style?: string;
};

export { TSession, TStyleColour, AuthUser };
