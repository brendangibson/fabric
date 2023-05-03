// See https://kit.svelte.dev/docs/types#app

import type { User } from '@auth/core/types';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

type User = {
	id: string;
};

type Session = {
	user: User;
	accessToken: string;
};

export { Session };
