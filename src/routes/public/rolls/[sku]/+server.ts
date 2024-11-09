import type { RequestHandler } from '@sveltejs/kit';
import { handleLoadError } from '../../../../db/load';
import { minRollSize } from '../../../../constants';

const ALLOWED_ORIGIN = 'https://www.sienandco.com';

export const GET: RequestHandler = async ({ request, locals, setHeaders, params }) => {
	if (request?.headers.get('origin') !== ALLOWED_ORIGIN) {
		console.error('Do not accept requests from: ', request?.headers.get('origin'));
		return new Response(new Blob(), { status: 401 });
	}

	const { db } = locals;
	const { sku } = params;

	try {
		const rollsPromise = db.sql`WITH first AS (
			SELECT (r."originalLength" - (SELECT COALESCE(SUM(length), 0) FROM cuts c WHERE c."rollId" = r.id )) AS remaining 
			FROM rolls r, "stylescolours" sc WHERE sc.sku = ${sku} AND r."styleColourId" = sc.id AND NOT(r.returned))
        SELECT * FROM first WHERE remaining > ${minRollSize}`;

		setHeaders({
			'Access-Control-Allow-Origin': ALLOWED_ORIGIN
		});

		return new Response(
			JSON.stringify({ data: { getRemainingRolls: (await rollsPromise)?.rows } })
		);
	} catch (e) {
		handleLoadError('error getting rolls', e);
		return new Response(new Blob(), { status: 500 });
	}
};
