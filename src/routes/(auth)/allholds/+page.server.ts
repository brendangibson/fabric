import { addHold, deleteHold, updateHold } from '../../../db/actions';
import { handleLoadError } from '../../../db/load';
import type { THold, TStyleColour } from '../../../fabric';

export async function load({ locals }) {
	const { db } = locals;

	try {
		const mainPromise = db.query<THold>(
			`SELECT h.*, sc."swatchUrl", s.name AS style, c.name As colour
            FROM holds h, stylescolours sc, styles s, colours c 
            WHERE h.expires > NOW() AND h."styleColourId" = sc.id AND s.id = sc."styleId" AND c.id = sc."colourId"`
		);

		const styleColourPromise = db.query<TStyleColour>(
			`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour 
			FROM stylescolours sc, styles s, colours c 
			WHERE sc."colourId" = c.id and sc."styleId" = s.id 
			ORDER BY style, colour`
		);

		const styleColourResult = (await styleColourPromise)?.rows;
		const mainResult = (await mainPromise)?.rows?.map((hold) => ({
			...hold,
			styleColour: styleColourResult.find((sc) => sc.id === hold.styleColourId)
		}));

		const payload = { holds: mainResult };

		return payload;
	} catch (e) {
		// TODO: why does this crash the server?
		handleLoadError('error getting holds', e);
	}
}

export const actions = {
	addHold,
	deleteHold,
	updateHold
};
