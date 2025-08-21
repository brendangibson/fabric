import type { VercelRequest, VercelResponse } from '@vercel/node';

const tools = [
	{
		name: 'get_current_stock',
		description: 'Get current stock levels for fabric inventory with optional filtering',
		inputSchema: {
			type: 'object',
			properties: {
				style: {
					type: 'string',
					description: 'Filter by style name (partial match)'
				},
				colour: {
					type: 'string',
					description: 'Filter by colour name (partial match)'
				},
				sku: {
					type: 'string',
					description: 'Filter by SKU (partial match)'
				},
				minStock: {
					type: 'number',
					description: 'Minimum stock level filter'
				},
				maxStock: {
					type: 'number',
					description: 'Maximum stock level filter'
				},
				includeHolds: {
					type: 'boolean',
					description: 'Include hold information in results',
					default: true
				},
				includeIncoming: {
					type: 'boolean',
					description: 'Include incoming orders in results',
					default: true
				},
				includeStandby: {
					type: 'boolean',
					description: 'Include standby items in results',
					default: true
				}
			}
		}
	},
	{
		name: 'get_stock_history',
		description: 'Get stock usage history for a specific SKU over a time period',
		inputSchema: {
			type: 'object',
			properties: {
				sku: {
					type: 'string',
					description: 'SKU to get history for',
					required: true
				},
				days: {
					type: 'number',
					description: 'Number of days to look back',
					default: 30
				}
			},
			required: ['sku']
		}
	},
	{
		name: 'get_low_stock_items',
		description: 'Get items with stock below a specified threshold',
		inputSchema: {
			type: 'object',
			properties: {
				threshold: {
					type: 'number',
					description: 'Stock threshold (items below this will be returned)',
					default: 10
				}
			}
		}
	},
	{
		name: 'get_stock_by_category',
		description: 'Get stock summary grouped by style/category',
		inputSchema: {
			type: 'object',
			properties: {}
		}
	},
	{
		name: 'search_inventory',
		description: 'Search inventory with natural language queries',
		inputSchema: {
			type: 'object',
			properties: {
				query: {
					type: 'string',
					description:
						'Natural language search query (e.g., "show me all linen fabrics with low stock")',
					required: true
				}
			},
			required: ['query']
		}
	}
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	return res.json({
		error: false,
		data: { tools },
		timestamp: new Date().toISOString()
	});
}
