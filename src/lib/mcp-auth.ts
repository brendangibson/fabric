// MCP Authentication Helper - OAuth Version
import { validateOAuthToken } from './oauth-config';

export const validateMCPRequest = async (
	request: Request
): Promise<{
	isValid: boolean;
	error?: string;
	status?: number;
	clientName?: string;
}> => {
	// Check Authorization header for Bearer token
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return {
			isValid: false,
			error: 'Missing or invalid Authorization header',
			status: 401
		};
	}

	const token = authHeader.replace('Bearer ', '');

	// Validate the OAuth token
	const validation = await validateOAuthToken(token);

	return {
		isValid: validation.isValid,
		error: validation.error,
		status: validation.status,
		clientName: validation.clientName
	};
};

// Helper to get MCP error response
export const getMCPError = (id: string, error: string, code: number = -32001) => {
	return {
		id,
		error: { code, message: error },
		jsonrpc: '2.0'
	};
};
