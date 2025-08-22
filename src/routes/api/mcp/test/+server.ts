import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Test basic database connection
		const result = await locals.db.sql`SELECT 1 as test`;

		return json({
			success: true,
			test: result.rows[0],
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Test endpoint error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
