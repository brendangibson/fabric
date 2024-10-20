import { addHold, deleteHold, updateHold } from '../../../db/actions';
import { handleLoadError } from '../../../db/load';
import type { THold, TStyleColour } from '../../../fabric';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { db, session } = locals;

	const owner = session?.userId;

	try {
		const mainPromise: Promise<{ rows: THold[] }> =
			db.sql`SELECT h.*, sc."swatchUrl", s.name AS style, c.name As colour
            FROM holds h, stylescolours sc, styles s, colours c 
            WHERE owner=${owner} AND expires > NOW() AND h."styleColourId" = sc.id AND s.id = sc."styleId" AND c.id = sc."colourId"`;

		const styleColourPromise: Promise<{ rows: TStyleColour[] }> =
			db.sql`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour 
			FROM stylescolours sc, styles s, colours c 
			WHERE sc."colourId" = c.id and sc."styleId" = s.id 
			ORDER BY style, colour`;

		const styleColourResult = (await styleColourPromise)?.rows;
		const mainResult = (await mainPromise)?.rows?.map((hold) => ({
			...hold,
			styleColour: styleColourResult.find((sc) => sc.id === hold.styleColourId)
		}));

		const payload = { holds: mainResult };

		return payload;
	} catch (e) {
		handleLoadError(`error getting holds for owner ${owner}`, e);
	}
};

export const actions = {
	addHold,
	deleteHold,
	updateHold
};
