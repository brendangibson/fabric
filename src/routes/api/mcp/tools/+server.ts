import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateMCPRequest } from '$lib/mcp-auth';

export const GET: RequestHandler = async ({ request }) => {
	const tools = [
		{
			name: 'get_current_stock',
			description: 'Get current stock levels for fabric inventory with optional filtering',
			inputSchema: {
				type: 'object',
				properties: {
					style: { type: 'string', description: 'Filter by style name' },
					colour: { type: 'string', description: 'Filter by colour name' },
					sku: { type: 'string', description: 'Filter by SKU' },
					minStock: { type: 'number', description: 'Minimum stock level' },
					maxStock: { type: 'number', description: 'Maximum stock level' }
				}
			}
		},
		{
			name: 'get_stock_history',
			description: 'Get stock history for a specific SKU over time',
			inputSchema: {
				type: 'object',
				properties: {
					sku: { type: 'string', description: 'SKU to get history for', required: true },
					days: { type: 'number', description: 'Number of days to look back' }
				}
			}
		},
		{
			name: 'get_low_stock_items',
			description: 'Get items with stock below a threshold',
			inputSchema: {
				type: 'object',
				properties: {
					threshold: { type: 'number', description: 'Stock threshold (default: 20)' }
				}
			}
		},
		{
			name: 'get_stock_by_category',
			description: 'Get stock grouped by style or colour',
			inputSchema: {
				type: 'object',
				properties: {
					groupBy: {
						type: 'string',
						enum: ['style', 'colour'],
						description: 'Group by style or colour'
					}
				}
			}
		},
		{
			name: 'search_inventory',
			description: 'Search inventory with natural language queries',
			inputSchema: {
				type: 'object',
				properties: {
					query: { type: 'string', description: 'Natural language search query', required: true }
				}
			}
		}
	];

	// Check if this is an MCP request
	const acceptHeader = request.headers.get('accept');
	const isMCPRequest =
		acceptHeader?.includes('application/mcp') || request.headers.get('x-mcp-protocol') === 'true';

	if (isMCPRequest) {
		// For MCP requests, require API key
		const auth = validateMCPRequest(request);
		if (!auth.isValid) {
			return json(
				{
					id: request.headers.get('x-mcp-id') || 'unknown',
					error: { code: -32001, message: auth.error || 'Authentication required' },
					jsonrpc: '2.0'
				},
				{ status: auth.status || 401 }
			);
		}

		// Return MCP protocol response
		return json({
			id: request.headers.get('x-mcp-id') || 'unknown',
			result: { tools },
			jsonrpc: '2.0'
		});
	} else {
		// Return HTTP API response
		return json({
			error: false,
			data: { tools },
			timestamp: new Date().toISOString()
		});
	}
};
