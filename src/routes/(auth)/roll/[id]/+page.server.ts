import { fail } from '@sveltejs/kit';
import type { QueryError } from '../../../../db';
import type { TCut, TRoll, TStyleColour } from '../../../../fabric';

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

		console.log('payload: ', payload);

		return payload;
	} catch (error) {
		return fail(422, {
			error: (error as QueryError)?.message
		});
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
			console.log('INSERTED!', result);
		} catch (error) {
			console.error('error adding cut: ', id, error, (error as QueryError)?.message);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},

	returnRoll: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');

		try {
			const result = await db.query(`UPDATE rolls SET returned = true WHERE id = $1`, [id]);
			console.log('RETURNED!', result);
		} catch (error) {
			console.error('error returning roll: ', id, error, (error as QueryError)?.message);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	unReturnRoll: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');

		try {
			const result = await db.query(`UPDATE rolls SET returned = false WHERE id = $1`, [id]);
			console.log('UNRETURNED!', result);
		} catch (error) {
			console.error('error unreturning roll: ', id, error, (error as QueryError)?.message);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	}
};
