import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	type CallToolRequest,
	type ListToolsRequest,
	type Tool
} from '@modelcontextprotocol/sdk/types.js';
import { FabricDatabase } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
	throw new Error('POSTGRES_URL environment variable is required');
}

const db = new FabricDatabase(POSTGRES_URL);

const tools: Tool[] = [
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

async function handleCallTool(request: CallToolRequest) {
	const { name, arguments: args } = request.params;

	try {
		switch (name) {
			case 'get_current_stock': {
				const result = await db.getCurrentStock(args as any);
				return {
					content: [
						{
							type: 'text',
							text:
								`Current stock query results:\n\n` +
								`Total items: ${result.summary.totalItems}\n` +
								`Total stock: ${result.summary.totalStock.toFixed(2)} yards\n` +
								`Total holds: ${result.summary.totalHolds.toFixed(2)} yards\n` +
								`Total incoming: ${result.summary.totalIncoming.toFixed(2)} yards\n` +
								`Total standby: ${result.summary.totalStandby.toFixed(2)} yards\n\n` +
								`Results:\n${result.results
									.map(
										(item) =>
											`- ${item.style} ${item.colour} (${item.sku}): ${(item.remaining || 0).toFixed(2)} yards remaining`
									)
									.join('\n')}`
						}
					]
				};
			}

			case 'get_stock_history': {
				const { sku, days = 30 } = args as { sku: string; days?: number };
				const history = await db.getStockHistory(sku, days);

				if (history.length === 0) {
					return {
						content: [
							{
								type: 'text',
								text: `No stock history found for SKU ${sku} in the last ${days} days.`
							}
						]
					};
				}

				const historyText = history
					.map(
						(day) => `${day.date}: ${day.cut_length.toFixed(2)} yards cut (${day.cut_count} cuts)`
					)
					.join('\n');

				return {
					content: [
						{
							type: 'text',
							text: `Stock history for ${sku} (last ${days} days):\n\n${historyText}`
						}
					]
				};
			}

			case 'get_low_stock_items': {
				const { threshold = 10 } = args as { threshold?: number };
				const lowStockItems = await db.getLowStockItems(threshold);

				if (lowStockItems.length === 0) {
					return {
						content: [
							{
								type: 'text',
								text: `No items found with stock below ${threshold} yards.`
							}
						]
					};
				}

				const itemsText = lowStockItems
					.map(
						(item) =>
							`${item.style} ${item.colour} (${item.sku}): ${(item.remaining || 0).toFixed(2)} yards remaining`
					)
					.join('\n');

				return {
					content: [
						{
							type: 'text',
							text: `Items with stock below ${threshold} yards:\n\n${itemsText}`
						}
					]
				};
			}

			case 'get_stock_by_category': {
				const categories = await db.getStockByCategory();

				const categoriesText = categories
					.map(
						(cat) =>
							`${cat.style}: ${cat.total_colours} colours, ${(cat.total_stock || 0).toFixed(2)} total yards`
					)
					.join('\n');

				return {
					content: [
						{
							type: 'text',
							text: `Stock by category:\n\n${categoriesText}`
						}
					]
				};
			}

			case 'search_inventory': {
				const { query } = args as { query: string };
				const lowerQuery = query.toLowerCase();

				// Simple natural language parsing
				let stockQuery: any = {};

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

				return {
					content: [
						{
							type: 'text',
							text:
								`Search results for "${query}":\n\n` +
								`Found ${result.summary.totalItems} items matching your criteria.\n\n` +
								`${result.results
									.map(
										(item) =>
											`${item.style} ${item.colour} (${item.sku}): ${(item.remaining || 0).toFixed(2)} yards remaining`
									)
									.join('\n')}`
						}
					]
				};
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	} catch (error) {
		return {
			content: [
				{
					type: 'text',
					text: `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
				}
			]
		};
	}
}

async function handleListTools(request: ListToolsRequest) {
	return { tools };
}

const server = new Server({
	name: 'fabric-inventory-mcp-server',
	version: '1.0.0'
});

server.setRequestHandler(ListToolsRequestSchema, handleListTools);
server.setRequestHandler(CallToolRequestSchema, handleCallTool);

const transport = new StdioServerTransport();
await server.connect(transport);

// Graceful shutdown
process.on('SIGINT', async () => {
	console.error('Shutting down...');
	await db.close();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	console.error('Shutting down...');
	await db.close();
	process.exit(0);
});
