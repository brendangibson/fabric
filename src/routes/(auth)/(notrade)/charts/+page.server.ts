import { handleLoadError } from '../../../../db/load';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { db } = locals;
	try {
		const mainPromise = db.sql`SELECT timestamp, length FROM cuts ORDER BY timestamp`;
		const stylesColoursPromise = db.sql`SELECT timestamp, length, r."styleColourId",  sc."swatchUrl", s.name AS style, co.name AS colour 
        FROM cuts c, rolls r, styles s, colours co, stylescolours sc 
        WHERE c."rollId" = r.id AND r."styleColourId" = sc.id AND sc."colourId" = co.id and sc."styleId" = s.id  
        ORDER BY timestamp`;

		const payload = {
			allCuts: (await mainPromise)?.rows,
			stylesColours: (await stylesColoursPromise)?.rows
		};

		return payload;
	} catch (e) {
		handleLoadError('error getting graph data', e);
	}
};
