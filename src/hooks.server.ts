/**
 * @file src/hooks.service.ts
 * File containing the hooks service
 */
// Import the SvelteKit Auth module
import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/core/providers/credentials';
// Import the Cognito service that we created earlier
import {
	getSession,
	refreshAccessToken,
	type CognitoUserSessionType
} from '$lib/domain/auth/services/Cognito';
// Type of the user object returned from the Cognito service
// Import the secret key from the environment variables
import { AUTH_SECRET } from '$env/static/private';
import { sequence } from '@sveltejs/kit/hooks';
import { createPool } from '@vercel/postgres';
import { POSTGRES_URL } from '$env/static/private';
import type { AuthUser, TSession } from './app';
import type { Handle } from '@sveltejs/kit';

interface AuthToken {
	accessToken: string;
	accessTokenExpires: number;
	refreshToken: string;
	user: {
		id: string;
		email: string;
	};
}
/**
 * Extract the user object from the session data. This is a helper function that we will use to extract the user object from the session data returned from the Cognito service.
 */
const extractUserFromSession = (session: CognitoUserSessionType): AuthUser => {
	if (!session?.isValid?.()) throw new Error('Invalid session');
	const user = session.getIdToken().payload;
	return {
		id: user.sub,
		email: user.email,
		accessToken: session.getAccessToken().getJwtToken(),
		accessTokenExpires: session.getAccessToken().getExpiration(),
		refreshToken: session.getRefreshToken().getToken()
	};
};
/**
 * Create the token object from the user object. This is a helper function that we will use to create the token object from the user object returned from the Cognito service.
 */
const createTokenFromUser = (user: AuthUser): AuthToken => {
	const token = {
		accessToken: user.accessToken,
		accessTokenExpires: user.accessTokenExpires,
		refreshToken: user.refreshToken,
		user: {
			id: user.id,
			email: user.email
		}
	};
	return token;
};

const authHandler = SvelteKitAuth({
	secret: AUTH_SECRET,
	providers: [
		Credentials({
			type: 'credentials',
			id: 'credentials',
			name: 'Cognito',
			credentials: {
				username: { label: 'Username', type: 'text', placeholder: 'user' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				if (!credentials) return null;
				try {
					const response = await getSession(
						credentials?.username as string,
						credentials?.password as string
					);
					return extractUserFromSession(response);
				} catch (error) {
					console.error('error: ', error);
					return null;
				}
			}
		})
	],
	/**
	 * Since we are using custom implementation; we have defined URLs for the login and error pages
	 */
	pages: {
		signIn: '/auth/login',
		signOut: '/auth/login',
		error: '/auth/login'
	},
	callbacks: {
		/**
		 * This callback is called whenever a JWT is created or updated.
		 * For the first time login we are creating a token from the user object returned by the authorize callback.
		 * For subsequent requests we are refreshing the access token and creating a new token from the user object. If the refresh token has expired
		 *
		 */
		// eslint
		async jwt({ token, user }): Promise<any> {
			// Initial sign in; we have plugged tokens and expiry date into the user object in the authorize callback; object
			// returned here will be saved in the JWT and will be available in the session callback as well as this callback
			// on next requests
			if (user) {
				return createTokenFromUser(user as AuthUser);
			}
			// Return previous token if the access token has not expired yet
			if (Date.now() < (token?.accessTokenExpires as number)) {
				return token;
			}
			try {
				const newUserSession = await refreshAccessToken({
					refreshToken: token?.refreshToken as string
				});
				const user = extractUserFromSession(newUserSession);
				return createTokenFromUser(user);
			} catch (error) {
				console.error(error);
				throw new Error('Invalid session');
			}
		},
		/**
		 * The session callback is called whenever a session is checked. By default, only a subset of the token is
		 * returned for increased security. We are sending properties required for the client side to work.
		 *
		 * @param session - Session object
		 * @param token - Decrypted JWT that we returned in the jwt callback
		 * @returns - Promise with the result of the session
		 */
		async session({ session, token }) {
			(session as unknown as TSession).user = token.user as AuthUser;
			(session as unknown as TSession).accessToken = token.accessToken as string;
			(session as unknown as TSession).error = token.error as string;
			return session;
		}
	}
});

const dbHandler: Handle = async ({ event, resolve }) => {
	event.locals.db = createPool({ connectionString: POSTGRES_URL });
	const response = await resolve(event);
	return response;
};

export const handle = sequence(authHandler, dbHandler);
