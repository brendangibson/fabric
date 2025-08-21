#!/usr/bin/env node

// Test script for Vercel-deployed MCP server
console.log('🚀 Testing Vercel-Deployed Fabric Inventory MCP Server\n');

// Replace with your actual Vercel deployment URL
const BASE_URL = process.env.VERCEL_URL || 'https://your-project.vercel.app';

const testEndpoints = [
	{
		name: 'List Tools',
		method: 'GET',
		url: `${BASE_URL}/api/tools`,
		description: 'Get available MCP tools'
	},
	{
		name: 'Get Current Stock',
		method: 'POST',
		url: `${BASE_URL}/api/stock`,
		body: {
			style: 'linen',
			minStock: 10
		},
		description: 'Query linen fabrics with at least 10 yards'
	},
	{
		name: 'Search Inventory',
		method: 'POST',
		url: `${BASE_URL}/api/search`,
		body: {
			query: 'show me all cotton fabrics with low stock'
		},
		description: 'Natural language search for cotton with low stock'
	}
];

console.log('📋 Test Endpoints:');
testEndpoints.forEach((endpoint, index) => {
	console.log(`${index + 1}. ${endpoint.name}`);
	console.log(`   ${endpoint.method} ${endpoint.url}`);
	console.log(`   ${endpoint.description}`);
	if (endpoint.body) {
		console.log(`   Body: ${JSON.stringify(endpoint.body)}`);
	}
	console.log('');
});

console.log('🧪 To Test Manually:');

console.log('\n1. List Available Tools:');
console.log(`   curl ${BASE_URL}/api/tools`);

console.log('\n2. Get Current Stock:');
console.log(`   curl -X POST ${BASE_URL}/api/stock \\`);
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"style": "linen", "minStock": 10}\'');

console.log('\n3. Search Inventory:');
console.log(`   curl -X POST ${BASE_URL}/api/search \\`);
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"query": "show me all cotton fabrics with low stock"}\'');

console.log('\n🔧 Configuration:');
console.log('- Set VERCEL_URL environment variable to your deployment URL');
console.log('- Ensure POSTGRES_URL is configured in Vercel dashboard');
console.log('- Check CORS settings if testing from a browser');

console.log('\n💡 Benefits of Vercel Deployment:');
console.log('- Serverless: No server management required');
console.log('- Global CDN: Fast response times worldwide');
console.log('- Auto-scaling: Handles traffic spikes automatically');
console.log('- Easy updates: Automatic deployments from Git');
console.log('- Built-in monitoring and analytics');

console.log('\n✅ Ready for production use!');
