import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { style, colour, sku, minStock, maxStock } = await request.json();

		// Enhanced query with stock information in YARDS
		const sqlQuery = locals.db.sql`SELECT sc.id, s.name AS style, c.name AS colour,
            (SELECT COALESCE(
                            (
                                SELECT SUM(CASE WHEN i.length > 0.5 THEN i.length ELSE 0 END)
                                FROM (SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, r."styleColourId" AS csi, r."originalLength" FROM rolls r
                                LEFT JOIN cuts c ON r.id = c."rollId"
                                WHERE NOT r.returned GROUP BY r.id
                            ) AS i
                            WHERE i.csi = sc.id
                            GROUP BY i.csi
                        ),0)) AS remaining,
            (SELECT COALESCE(SUM(length),0)
                        FROM holds WHERE "styleColourId" = sc.id AND expires > NOW()) AS "holdsLength",
            (SELECT COALESCE(SUM(length),0) FROM incoming WHERE "styleColourId" = sc.id) AS "incomingLength",
            (SELECT COALESCE(SUM(length),0) FROM standby WHERE "styleColourId" = sc.id) AS "standbyLength"
        FROM stylescolours sc, styles s, colours c 
        WHERE sc."colourId" = c.id and sc."styleId" = s.id AND sc.hidden = false
        ORDER BY remaining DESC`;

		const result = await sqlQuery;
		const rows = result.rows;

		return json({
			error: false,
			data: {
				timestamp: new Date().toISOString(),
				query: { style, colour, sku, minStock, maxStock },
				results: rows,
				count: rows.length,
				units: 'yards'
			},
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Stock query error:', error);
		return json(
			{
				error: true,
				message: 'Failed to query stock',
				details: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
