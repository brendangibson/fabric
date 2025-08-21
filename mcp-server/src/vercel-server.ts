import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FabricDatabase } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
	throw new Error('POSTGRES_URL environment variable is required');
}

const db = new FabricDatabase(POSTGRES_URL);

// MCP-compatible tool definitions
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

// Helper function to handle CORS
function setCORSHeaders(res: VercelResponse) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Helper function to send error responses
function sendError(res: VercelResponse, status: number, message: string) {
	res.status(status).json({
		error: true,
		message,
		timestamp: new Date().toISOString()
	});
}

// Helper function to send success responses
function sendSuccess(res: VercelResponse, data: any) {
	res.json({
		error: false,
		data,
		timestamp: new Date().toISOString()
	});
}

// List available tools (MCP-compatible)
export async function GET(req: VercelRequest, res: VercelResponse) {
	setCORSHeaders(res);

	if (req.url?.includes('/tools')) {
		return sendSuccess(res, { tools });
	}

	// Default response for root endpoint
	return sendSuccess(res, {
		message: 'Fabric Inventory MCP Server',
		version: '1.0.0',
		endpoints: {
			'/api/tools': 'List available tools',
			'/api/stock': 'Get current stock (POST with parameters)',
			'/api/history': 'Get stock history (POST with SKU)',
			'/api/low-stock': 'Get low stock items (POST with threshold)',
			'/api/categories': 'Get stock by category',
			'/api/search': 'Search inventory (POST with query)'
		}
	});
}

// Handle POST requests for tool execution
export async function POST(req: VercelRequest, res: VercelResponse) {
	setCORSHeaders(res);

	try {
		const { tool, ...args } = req.body;

		if (!tool) {
			return sendError(res, 400, 'Tool name is required');
		}

		switch (tool) {
			case 'get_current_stock': {
				const result = await db.getCurrentStock(args);
				return sendSuccess(res, result);
			}

			case 'get_stock_history': {
				const { sku, days = 30 } = args;
				if (!sku) {
					return sendError(res, 400, 'SKU is required for stock history');
				}
				const history = await db.getStockHistory(sku, days);
				return sendSuccess(res, { sku, days, history });
			}

			case 'get_low_stock_items': {
				const { threshold = 10 } = args;
				const lowStockItems = await db.getLowStockItems(threshold);
				return sendSuccess(res, { threshold, items: lowStockItems });
			}

			case 'get_stock_by_category': {
				const categories = await db.getStockByCategory();
				return sendSuccess(res, { categories });
			}

			case 'search_inventory': {
				const { query } = args;
				if (!query) {
					return sendError(res, 400, 'Search query is required');
				}

				// Simple natural language parsing
				let stockQuery: any = {};
				const lowerQuery = query.toLowerCase();

				if (lowerQuery.includes('linen')) {
					stockQuery.style = 'linen';
				}
				if (lowerQuery.includes('cotton')) {
					stockQuery.style = 'cotton';
				}
				if (lowerQuery.includes('wool')) {
					stockQuery.style = 'wool';
				}
				if (lowerQuery.includes('silk')) {
					stockQuery.style = 'silk';
				}

				if (lowerQuery.includes('low stock') || lowerQuery.includes('below')) {
					stockQuery.minStock = 0;
					stockQuery.maxStock = 20;
				}

				if (lowerQuery.includes('out of stock') || lowerQuery.includes('no stock')) {
					stockQuery.maxStock = 0;
				}

				const result = await db.getCurrentStock(stockQuery);
				return sendSuccess(res, { query, result });
			}

			default:
				return sendError(res, 400, `Unknown tool: ${tool}`);
		}
	} catch (error) {
		console.error('Error executing tool:', error);
		return sendError(
			res,
			500,
			`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: VercelRequest, res: VercelResponse) {
	setCORSHeaders(res);
	res.status(200).end();
}
