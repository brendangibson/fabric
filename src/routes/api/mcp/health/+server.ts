import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		service: 'fabric-inventory',
		timestamp: new Date().toISOString(),
		endpoints: {
			tools: '/api/mcp/tools',
			stock: '/api/mcp/stock',
			search: '/api/mcp/search',
			health: '/api/mcp/health'
		}
	});
};
