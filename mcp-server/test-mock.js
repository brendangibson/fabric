#!/usr/bin/env node

// Simple test script to demonstrate the mock MCP server
console.log('🧪 Testing Fabric Inventory MCP Server (Mock Version)\n');

// Simulate MCP tool calls
const mockTools = [
	{
		name: 'get_current_stock',
		description: 'Get current stock levels for fabric inventory with optional filtering',
		examples: [{ style: 'Linen' }, { minStock: 20 }, { maxStock: 15 }]
	},
	{
		name: 'get_low_stock_items',
		description: 'Get items with stock below a specified threshold',
		examples: [{ threshold: 10 }, { threshold: 20 }]
	},
	{
		name: 'search_inventory',
		description: 'Search inventory with natural language queries',
		examples: [
			{ query: 'show me all linen fabrics' },
			{ query: 'find fabrics with low stock' },
			{ query: 'cotton fabrics below 15 yards' }
		]
	}
];

console.log('📋 Available Tools:');
mockTools.forEach((tool, index) => {
	console.log(`${index + 1}. ${tool.name}`);
	console.log(`   ${tool.description}`);
	console.log(`   Examples:`);
	tool.examples.forEach((example) => {
		console.log(`     - ${JSON.stringify(example)}`);
	});
	console.log('');
});

console.log('🎯 Mock Inventory Data:');
const mockData = [
	{
		style: 'Linen',
		colour: 'Natural',
		sku: 'LINNAT',
		remaining: 45.5,
		holds: 5.0,
		incoming: 20.0,
		standby: 2.5
	},
	{
		style: 'Cotton',
		colour: 'White',
		sku: 'COTWHI',
		remaining: 12.3,
		holds: 3.0,
		incoming: 0,
		standby: 1.0
	},
	{
		style: 'Wool',
		colour: 'Charcoal',
		sku: 'WOOCHA',
		remaining: 8.7,
		holds: 0,
		incoming: 15.0,
		standby: 0
	},
	{
		style: 'Silk',
		colour: 'Ivory',
		sku: 'SILIVO',
		remaining: 25.0,
		holds: 10.0,
		incoming: 0,
		standby: 5.0
	}
];

mockData.forEach((item) => {
	console.log(`   ${item.style} ${item.colour} (${item.sku}): ${item.remaining} yards remaining`);
	console.log(
		`     - Holds: ${item.holds} yards, Incoming: ${item.incoming} yards, Standby: ${item.standby} yards`
	);
});

console.log('\n🚀 To test the actual MCP server:');
console.log('1. Start the mock server: node dist/mock-server.js');
console.log('2. In another terminal, test with an MCP client');
console.log('3. Or use the CLI test: npm run cli (requires database connection)');
console.log('\n💡 The mock server provides the same interface as the real server');
console.log('   but uses sample data instead of connecting to a database.');
