// OAuth Configuration and Validation
import { jwtVerify, createRemoteJWKSet } from 'jose';

export interface OAuthConfig {
	issuer: string;
	audience: string;
	clientId: string;
	clientSecret: string;
}

export interface TokenPayload {
	sub: string;
	aud: string;
	iss: string;
	exp: number;
	iat: number;
	scope?: string;
	client_id?: string;
}

export interface ValidationResult {
	isValid: boolean;
	error?: string;
	status?: number;
	payload?: TokenPayload;
	clientName?: string;
}

// Get OAuth configuration from environment variables
export const getOAuthConfig = (): OAuthConfig => {
	const issuer = process.env.OAUTH_ISSUER_URL;
	const audience = process.env.OAUTH_AUDIENCE;
	const clientId = process.env.OAUTH_CLIENT_ID;
	const clientSecret = process.env.OAUTH_CLIENT_SECRET;

	if (!issuer || !audience || !clientId || !clientSecret) {
		throw new Error('Missing required OAuth environment variables');
	}

	return {
		issuer,
		audience,
		clientId,
		clientSecret
	};
};

// Validate OAuth token
export const validateOAuthToken = async (token: string): Promise<ValidationResult> => {
	try {
		const config = getOAuthConfig();

		// Create JWKS client for token verification
		const JWKS = createRemoteJWKSet(new URL(`${config.issuer}/.well-known/jwks.json`));

		// Verify the JWT token
		const { payload } = await jwtVerify(token, JWKS, {
			issuer: config.issuer,
			audience: config.audience,
			clockTolerance: 30 // Allow 30 seconds clock skew
		});

		const tokenPayload = payload as TokenPayload;

		// Check if token is expired
		const now = Math.floor(Date.now() / 1000);
		if (tokenPayload.exp < now) {
			return {
				isValid: false,
				error: 'Token has expired',
				status: 401
			};
		}

		// Check if token is issued in the future (clock skew protection)
		if (tokenPayload.iat > now + 30) {
			return {
				isValid: false,
				error: 'Token issued in the future',
				status: 401
			};
		}

		// Validate audience
		if (tokenPayload.aud !== config.audience) {
			return {
				isValid: false,
				error: 'Invalid audience',
				status: 403
			};
		}

		// Check required scopes if specified
		if (process.env.OAUTH_REQUIRED_SCOPE && tokenPayload.scope) {
			const requiredScopes = process.env.OAUTH_REQUIRED_SCOPE.split(' ');
			const tokenScopes = tokenPayload.scope.split(' ');

			const hasRequiredScope = requiredScopes.some((scope) => tokenScopes.includes(scope));

			if (!hasRequiredScope) {
				return {
					isValid: false,
					error: 'Insufficient scope',
					status: 403
				};
			}
		}

		return {
			isValid: true,
			payload: tokenPayload,
			clientName: tokenPayload.sub || tokenPayload.client_id || 'oauth-client'
		};
	} catch (error) {
		console.error('OAuth token validation error:', error);

		if (error instanceof Error) {
			if (error.message.includes('JWT')) {
				return {
					isValid: false,
					error: 'Invalid JWT token',
					status: 401
				};
			}
			if (error.message.includes('Missing required OAuth')) {
				return {
					isValid: false,
					error: 'OAuth configuration error',
					status: 500
				};
			}
		}

		return {
			isValid: false,
			error: 'Token validation failed',
			status: 401
		};
	}
};
