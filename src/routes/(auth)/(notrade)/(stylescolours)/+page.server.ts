import { handleLoadError } from '../../../../db/load';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { db } = locals;
	try {
		const { rows: stylesColours } =
			await db.sql`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour 
			FROM stylescolours sc, styles s, colours c 
			WHERE sc."colourId" = c.id and sc."styleId" = s.id 
			ORDER BY style, colour`;

		return {
			stylesColours
		};
	} catch (e) {
		handleLoadError('error getting stylescolours', e);
	}
};
