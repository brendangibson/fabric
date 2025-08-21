import { handleLoadError } from '$src/db/load';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { db } = locals;
	try {
		// Get all rolls with their original length and when they were received
		// Use LEFT JOIN to include rolls even if they don't have shipments (like the status page)
		const rollsPromise = db.sql`SELECT r.id, COALESCE(s."dateReceived", NOW()) AS timestamp, r."originalLength" AS length 
		FROM rolls r 
		LEFT JOIN shipments s ON r."shipmentId" = s.id 
		WHERE NOT r.returned 
		ORDER BY timestamp`;

		// Get all cuts with their roll ID and timestamp
		const cutsPromise = db.sql`SELECT c.timestamp, c.length, c."rollId" FROM cuts c, rolls r WHERE c."rollId" = r.id AND NOT r.returned ORDER BY timestamp`;

		// Get style/colour specific rolls
		const stylesColoursRollsPromise = db.sql`SELECT r.id, COALESCE(sh."dateReceived", NOW()) AS timestamp, r."originalLength" AS length, r."styleColourId", sc."swatchUrl", s.name AS style, co.name AS colour 
        FROM rolls r 
        LEFT JOIN shipments sh ON r."shipmentId" = sh.id
        JOIN stylescolours sc ON r."styleColourId" = sc.id
        JOIN styles s ON sc."styleId" = s.id
        JOIN colours co ON sc."colourId" = co.id
        WHERE NOT r.returned
		ORDER BY timestamp`;

		// Get style/colour specific cuts with roll ID
		const stylesColoursCutsPromise = db.sql`SELECT c.timestamp, c.length, c."rollId", r."styleColourId", sc."swatchUrl", s.name AS style, co.name AS colour 
        FROM cuts c 
        JOIN rolls r ON c."rollId" = r.id 
        JOIN stylescolours sc ON r."styleColourId" = sc.id
        JOIN styles s ON sc."styleId" = s.id
        JOIN colours co ON sc."colourId" = co.id
        WHERE NOT r.returned 
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
