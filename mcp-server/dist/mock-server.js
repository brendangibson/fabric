import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
// Mock data for testing
const mockInventory = [
    {
        id: '1',
        style: 'Linen',
        colour: 'Natural',
        sku: 'LINNAT',
        remaining: 45.5,
        holdsLength: 5.0,
        incomingLength: 20.0,
        standbyLength: 2.5
    },
    {
        id: '2',
        style: 'Cotton',
        colour: 'White',
        sku: 'COTWHI',
        remaining: 12.3,
        holdsLength: 3.0,
        incomingLength: 0,
        standbyLength: 1.0
    },
    {
        id: '3',
        style: 'Wool',
        colour: 'Charcoal',
        sku: 'WOOCHA',
        remaining: 8.7,
        holdsLength: 0,
        incomingLength: 15.0,
        standbyLength: 0
    },
    {
        id: '4',
        style: 'Silk',
        colour: 'Ivory',
        sku: 'SILIVO',
        remaining: 25.0,
        holdsLength: 10.0,
        incomingLength: 0,
        standbyLength: 5.0
    }
];
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
                }
            }
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
        name: 'search_inventory',
        description: 'Search inventory with natural language queries',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Natural language search query (e.g., "show me all linen fabrics with low stock")',
                    required: true
                }
            },
            required: ['query']
        }
    }
];
async function handleCallTool(request) {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'get_current_stock': {
                const { style, colour, sku, minStock, maxStock } = args;
                let filtered = mockInventory;
                if (style) {
                    filtered = filtered.filter(item => item.style.toLowerCase().includes(style.toLowerCase()));
                }
                if (colour) {
                    filtered = filtered.filter(item => item.colour.toLowerCase().includes(colour.toLowerCase()));
                }
                if (sku) {
                    filtered = filtered.filter(item => item.sku.toLowerCase().includes(sku.toLowerCase()));
                }
                if (minStock !== undefined) {
                    filtered = filtered.filter(item => item.remaining >= minStock);
                }
                if (maxStock !== undefined) {
                    filtered = filtered.filter(item => item.remaining <= maxStock);
                }
                const summary = {
                    totalItems: filtered.length,
                    totalStock: filtered.reduce((sum, item) => sum + item.remaining, 0),
                    totalHolds: filtered.reduce((sum, item) => sum + item.holdsLength, 0),
                    totalIncoming: filtered.reduce((sum, item) => sum + item.incomingLength, 0),
                    totalStandby: filtered.reduce((sum, item) => sum + item.standbyLength, 0)
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Current stock query results:\n\n` +
                                `Total items: ${summary.totalItems}\n` +
                                `Total stock: ${summary.totalStock.toFixed(2)} yards\n` +
                                `Total holds: ${summary.totalHolds.toFixed(2)} yards\n` +
                                `Total incoming: ${summary.totalIncoming.toFixed(2)} yards\n` +
                                `Total standby: ${summary.totalStandby.toFixed(2)} yards\n\n` +
                                `Results:\n${filtered
                                    .map((item) => `- ${item.style} ${item.colour} (${item.sku}): ${item.remaining.toFixed(2)} yards remaining`)
                                    .join('\n')}`
                        }
                    ]
                };
            }
            case 'get_low_stock_items': {
                const { threshold = 10 } = args;
                const lowStockItems = mockInventory.filter(item => item.remaining < threshold);
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
                    .map((item) => `${item.style} ${item.colour} (${item.sku}): ${item.remaining.toFixed(2)} yards remaining`)
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
            case 'search_inventory': {
                const { query } = args;
                const lowerQuery = query.toLowerCase();
                // Simple natural language parsing
                let stockQuery = {};
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
                // Apply filters
                let filtered = mockInventory;
                if (stockQuery.style) {
                    filtered = filtered.filter(item => item.style.toLowerCase().includes(stockQuery.style.toLowerCase()));
                }
                if (stockQuery.minStock !== undefined) {
                    filtered = filtered.filter(item => item.remaining >= stockQuery.minStock);
                }
                if (stockQuery.maxStock !== undefined) {
                    filtered = filtered.filter(item => item.remaining <= stockQuery.maxStock);
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Search results for "${query}":\n\n` +
                                `Found ${filtered.length} items matching your criteria.\n\n` +
                                `${filtered
                                    .map((item) => `${item.style} ${item.colour} (${item.sku}): ${item.remaining.toFixed(2)} yards remaining`)
                                    .join('\n')}`
                        }
                    ]
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
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
async function handleListTools(request) {
    return { tools };
}
const server = new Server({
    name: 'fabric-inventory-mcp-server-mock',
    version: '1.0.0'
});
server.setRequestHandler(ListToolsRequestSchema, handleListTools);
server.setRequestHandler(CallToolRequestSchema, handleCallTool);
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Mock MCP Server started successfully!');
console.error('This server uses mock data for testing purposes.');
// Graceful shutdown
process.on('SIGINT', async () => {
    console.error('Shutting down mock server...');
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.error('Shutting down mock server...');
    process.exit(0);
});
