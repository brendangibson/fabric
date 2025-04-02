import { handleLoadError } from '../../../../../db/load';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { db } = locals;
	const { id } = params;

	try {
		const { rows: styleColours } =
			await db.sql`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour 
			FROM stylescolours sc, styles s, colours c 
			WHERE sc."colourId" = c.id AND sc."styleId" = ${id} AND s.id = ${id}
			ORDER BY style, colour`;

		const { rows: styleColour } = await db.sql`SELECT s.name
			FROM styles s
			WHERE s.id = ${id}`;

		return {
			styleColours,
			styleColour: styleColour[0].name
		};
	} catch (e) {
		handleLoadError('error getting stylecolours', e);
	}
};
