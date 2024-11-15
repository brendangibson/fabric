import { handleLoadError } from '../../../../../db/load';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { db } = locals;
	try {
		const cutsPromise = db.sql`SELECT timestamp, length FROM cuts c, rolls r WHERE c."rollId" = r.id AND NOT r.returned ORDER BY timestamp`;
		const rollsPromise = db.sql`SELECT s."dateReceived" AS timestamp, r."originalLength" AS length FROM shipments s, rolls r WHERE r."shipmentId" = s.id AND NOT r.returned ORDER BY "dateReceived"`;

		const stylesColoursRollsPromise = db.sql`SELECT sh."dateReceived" AS timestamp, r."originalLength" AS length, r."styleColourId",  sc."swatchUrl", s.name AS style, co.name AS colour 
        FROM shipments sh, rolls r, styles s, colours co, stylescolours sc 
        WHERE r."shipmentId" = sh.id AND r."styleColourId" = sc.id AND sc."colourId" = co.id AND sc."styleId" = s.id AND NOT r.returned
		ORDER BY timestamp`;
		const stylesColoursCutsPromise = db.sql`SELECT timestamp, length, r."styleColourId",  sc."swatchUrl", s.name AS style, co.name AS colour 
        FROM cuts c, rolls r, styles s, colours co, stylescolours sc 
        WHERE c."rollId" = r.id AND r."styleColourId" = sc.id AND sc."colourId" = co.id AND sc."styleId" = s.id AND NOT r.returned
		ORDER BY timestamp`;

		const payload = {
			allCuts: (await cutsPromise)?.rows,
			allRolls: (await rollsPromise)?.rows,
			stylesColoursRolls: (await stylesColoursRollsPromise)?.rows,
			stylesColoursCuts: (await stylesColoursCutsPromise)?.rows
		};

		return payload;
	} catch (e) {
		handleLoadError('error getting graph data', e);
	}
};
