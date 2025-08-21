#!/usr/bin/env node

// Simple MCP client test script
console.log('🔌 Testing MCP Client Connection\n');

// Simulate MCP client requests
const testRequests = [
	{
		type: 'list_tools',
		description: 'List available tools'
	},
	{
		type: 'call_tool',
		tool: 'get_current_stock',
		args: { style: 'Linen' },
		description: 'Get all linen fabrics'
	},
	{
		type: 'call_tool',
		tool: 'get_low_stock_items',
		args: { threshold: 15 },
		description: 'Find items with less than 15 yards'
	},
	{
		type: 'call_tool',
		tool: 'search_inventory',
		args: { query: 'show me all cotton fabrics with low stock' },
		description: 'Natural language search for cotton with low stock'
	}
];

console.log('📋 Test Requests:');
testRequests.forEach((req, index) => {
	console.log(`${index + 1}. ${req.type.toUpperCase()}: ${req.description}`);
	if (req.tool) {
		console.log(`   Tool: ${req.tool}`);
		console.log(`   Args: ${JSON.stringify(req.args)}`);
	}
	console.log('');
});

console.log('🎯 Expected Results:');
console.log('1. List Tools: Should return 3 available tools');
console.log('2. Get Linen: Should return 1 item (Linen Natural with 45.5 yards)');
console.log('3. Low Stock: Should return 2 items (Cotton White: 12.3, Wool Charcoal: 8.7)');
console.log('4. Search: Should return 1 item (Cotton White: 12.3 yards)');

console.log('\n💡 To test with a real MCP client:');
console.log('1. Install an MCP client (like Claude Desktop)');
console.log('2. Configure it to use this server');
console.log('3. Ask questions like:');
console.log('   - "What\'s the current stock of linen fabrics?"');
console.log('   - "Show me items with less than 15 yards remaining"');
console.log('   - "Find all cotton fabrics with low stock"');

console.log('\n🔧 Server Status:');
console.log('- Mock server should be running on stdio');
console.log('- Ready to accept MCP client connections');
console.log('- Using sample inventory data for testing');
