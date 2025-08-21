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
		const POSTGRES_URL = process.env.POSTGRES_URL;
		if (!POSTGRES_URL) {
			return res.status(500).json({
				error: true,
				message: 'Database connection not configured'
			});
		}

		const db = new FabricDatabase(POSTGRES_URL);
		const result = await db.getCurrentStock(req.body);

		await db.close();

		return res.json({
			error: false,
			data: result,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error getting stock:', error);
		return res.status(500).json({
			error: true,
			message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			timestamp: new Date().toISOString()
		});
	}
}
