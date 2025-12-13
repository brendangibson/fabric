// See https://kit.svelte.dev/docs/types#app

import type { VercelPool } from '@vercel/postgres';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: VercelPool;
			auth?: () => {
				userId: string | null | undefined;
				sessionId: string | null | undefined;
				sessionClaims?: {
					org_role?: string;
					[x: string]: unknown;
				};
			};
			session?: {
				userId: string;
				claims: {
					org_role: string;
				};
			};
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
