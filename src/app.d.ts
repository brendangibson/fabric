// See https://kit.svelte.dev/docs/types#app

import type { VercelPool } from '@vercel/postgres';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: VercelPool;
			user: AuthUser;
		}
		// interface PageData {}
		// interface Platform {}
	}
	namespace svelteHTML {
		interface HTMLAttributes {
			'on:outclick'?: (event: CustomEvent) => void;
		}
	}
}

type AuthUser = {
	id: string;
	email: string;
	username: string;
	accessToken: string;
	accessTokenExpires: number;
	refreshToken: string;
	level?: 'admin' | 'editor' | 'trade';
};

type User = {
	id: string;
	username: string;
	email: string;
	level: 'admin' | 'editor' | 'trade';
};

type TSession = {
	user: User;
	accessToken: string;
	error: string;
};

export { TSession, AuthUser };
