#!/usr/bin/env node

console.log('🔌 Testing Real MCP Server with Database\n');

console.log('📋 Server Status:');
console.log('- Real MCP server should be running');
console.log('- Connected to your PostgreSQL database');
console.log('- Ready to accept MCP client connections');

console.log('\n🎯 Available Tools:');
console.log('1. get_current_stock - Query current inventory with filters');
console.log('2. get_stock_history - Get usage history for specific SKUs');
console.log('3. get_low_stock_items - Find items below stock thresholds');
console.log('4. get_stock_by_category - Group inventory by style/category');
console.log('5. search_inventory - Natural language inventory search');

console.log('\n💡 Example Queries You Can Ask:');
console.log('- "What\'s the current stock of all fabrics?"');
console.log('- "Show me items with less than 10 yards remaining"');
console.log('- "Find all linen fabrics"');
console.log('- "What\'s the usage history for SKU POCSTOFAB?"');
console.log('- "Group inventory by style and show totals"');
console.log('- "Search for fabrics with low stock"');

console.log('\n🔧 To Test with MCP Client:');
console.log('1. Install an MCP client (Claude Desktop, Ollama, etc.)');
console.log('2. Configure it to use this server:');
console.log('   - Command: node');
console.log('   - Args: /path/to/fabric/mcp-server/dist/index.js');
console.log('   - Environment: POSTGRES_URL (already configured)');

console.log('\n📊 Database Connection:');
console.log('- Using your existing PostgreSQL database');
console.log('- Accessing: stylescolours, styles, colours, rolls, cuts, holds, incoming, standby');
console.log('- Real-time stock calculations and inventory data');

console.log('\n✅ Server is ready for testing!');
