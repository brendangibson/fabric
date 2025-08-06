import type { RequestHandler } from '@sveltejs/kit';
import { handleLoadError } from '$src/db/load';
import { minRollSize } from '$src/constants';

const ALLOWED_ORIGIN = 'https://www.sienandco.com';

export const GET: RequestHandler = async ({ request, locals, setHeaders }) => {
	if (request?.headers.get('origin') !== ALLOWED_ORIGIN) {
		console.error('Do not accept requests from: ', request?.headers.get('origin'));
		return new Response(new Blob(), { status: 401 });
	}

	const { db } = locals;

	try {
		const mainPromise = db.sql`SELECT sc.sku, 
            (SELECT COALESCE(
                            (
                                SELECT SUM(CASE WHEN i.length > ${minRollSize} THEN i.length ELSE 0 END)
                                FROM (SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, r."styleColourId" AS csi, r."originalLength" FROM rolls r
                                LEFT JOIN cuts c ON r.id = c."rollId"
                                WHERE NOT r.returned GROUP BY r.id
                            ) AS i
                            WHERE i.csi = sc.id
                            GROUP BY i.csi
                        ),0))
                        AS stock,
            (SELECT COALESCE(SUM(length),0)
                        FROM holds WHERE "styleColourId" = sc.id AND expires > NOW()) AS "holds",
            (SELECT COALESCE(SUM(length),0) FROM standby WHERE "styleColourId" = sc.id) AS "standby"
        FROM stylescolours sc`;

		setHeaders({
			'Access-Control-Allow-Origin': ALLOWED_ORIGIN
		});

		return new Response(JSON.stringify({ data: { getRemaining: (await mainPromise)?.rows } }));
	} catch (e) {
		handleLoadError('error getting rolls', e);
		return new Response(new Blob(), { status: 500 });
	}
};
