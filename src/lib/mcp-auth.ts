// MCP Authentication Helper
export const validateMCPRequest = (
	request: Request
): {
	isValid: boolean;
	error?: string;
	status?: number;
	clientName?: string;
} => {
	// Check API key
	const mcpApiKey = request.headers.get('x-mcp-api-key');
	const apiKeysString = process.env.MCP_API_KEYS;

	if (!mcpApiKey || !apiKeysString) {
		return {
			isValid: false,
			error: 'Missing API key',
			status: 401
		};
	}

	// Parse API keys (support both formats)
	const apiKeys = apiKeysString.split(',').map((key) => key.trim());

	// Check if the provided key matches any valid key
	let isValidKey = false;
	let clientName = 'unknown';

	for (const keyEntry of apiKeys) {
		if (keyEntry.includes(':')) {
			// Format: key:clientname
			const [key, name] = keyEntry.split(':');
			if (key === mcpApiKey) {
				isValidKey = true;
				clientName = name;
				break;
			}
		} else {
			// Format: just the key
			if (keyEntry === mcpApiKey) {
				isValidKey = true;
				clientName = 'authenticated';
				break;
			}
		}
	}

	if (!isValidKey) {
		return {
			isValid: false,
			error: 'Invalid API key',
			status: 401
		};
	}

	return { isValid: true, clientName };
};

// Helper to get MCP error response
export const getMCPError = (id: string, error: string, code: number = -32001) => {
	return {
		id,
		error: { code, message: error },
		jsonrpc: '2.0'
	};
};
