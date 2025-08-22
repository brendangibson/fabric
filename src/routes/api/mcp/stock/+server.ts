import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentStock } from '$db/mcp';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { style, colour, sku, minStock, maxStock } = await request.json();

		// Use our new MCP-specific getCurrentStock function
		const stockResponse = await getCurrentStock(locals.db, {
			style,
			colour,
			sku,
			minStock,
			maxStock
		});

		return json({
			error: false,
			data: stockResponse,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Stock query error:', error);
		return json(
			{
				error: true,
				message: 'Failed to query stock',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
