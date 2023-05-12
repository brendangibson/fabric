import type { TCut, TRoll, TStyleColour } from '../../../../../fabric';
import { handleActionError } from '../../../../../db/actions';
import { handleLoadError } from '../../../../../db/load';

export async function load({ locals, params }) {
	const { db } = locals;
	const id = params.id;
	try {
		const mainPromise = db.query<TRoll>(`SELECT * FROM rolls r WHERE r.id=$1`, [id]);
		const styleColourPromise = db.query<TStyleColour>(
			`SELECT sc."swatchUrl", s.name AS style, c.name AS colour, s.weight, s.thickness  FROM stylescolours sc, rolls r, styles s, colours c  WHERE r.id=$1 AND r."styleColourId" = sc.id AND  sc."colourId" = c.id and sc."styleId" = s.id`,
			[id]
		);
		const cutsPromise = db.query<TCut>(
			`SELECT length, reason, notes, timestamp FROM cuts c WHERE c."rollId" =  $1`,
			[id]
		);

		const mainResult = await mainPromise;
		const styleColourResult = await styleColourPromise;
		const cutsResult = await cutsPromise;

		const payload = {
			roll: {
				...mainResult?.rows?.[0],
				...{ styleColour: styleColourResult?.rows?.[0] },
				...{ cuts: cutsResult?.rows }
			}
		};

		return payload;
	} catch (e) {
		handleLoadError(`error getting rolls for ${id}`, e);
	}
}

export const actions = {
	addCut: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');
		const reason = data.get('reason');
		const notes = data.get('notes');

		try {
			const result = await db.query(
				`INSERT INTO cuts("rollId", length, reason, notes) VALUES ($1, $2, $3, $4)`,
				[id, length, reason, notes]
			);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows updated when adding cut to ${id}`);
			}
		} catch (error) {
			return handleActionError(`error adding cut to ${id}`, error);
		}
	},

	returnRoll: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');

		try {
			const result = await db.query(`UPDATE rolls SET returned = true WHERE id = $1`, [id]);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows updated when returning roll: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error returning roll: ${id}`, error);
		}
	},
	unReturnRoll: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');

		try {
			const result = await db.query(`UPDATE rolls SET returned = false WHERE id = $1`, [id]);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows updated when unreturning roll: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error unreturning roll: ${id}`, error);
		}
	}
};
