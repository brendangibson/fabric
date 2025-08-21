import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FabricDatabase } from '../src/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { query } = req.body;
		if (!query) {
			return res.status(400).json({
				error: true,
				message: 'Search query is required'
			});
		}

		const POSTGRES_URL = process.env.POSTGRES_URL;
		if (!POSTGRES_URL) {
			return res.status(500).json({
				error: true,
				message: 'Database connection not configured'
			});
		}

		const db = new FabricDatabase(POSTGRES_URL);

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
		await db.close();

		return res.json({
			error: false,
			data: { query, result },
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error searching inventory:', error);
		return res.status(500).json({
			error: true,
			message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			timestamp: new Date().toISOString()
		});
	}
}
