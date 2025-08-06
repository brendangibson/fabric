import { handleActionError } from '$src/db/actions';
import { handleLoadError } from '$src/db/load';
import type { PageServerLoad, RequestEvent } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { db } = locals;
	const id = params.id;
	try {
		const mainPromise = db.sql`SELECT * FROM rolls r WHERE r.id=${id}`;
		const styleColourPromise = db.sql`SELECT sc."swatchUrl", s.name AS style, c.name AS colour, s.weight, s.thickness  FROM stylescolours sc, rolls r, styles s, colours c  WHERE r.id=${id} AND r."styleColourId" = sc.id AND  sc."colourId" = c.id and sc."styleId" = s.id`;

		const cutsPromise = db.sql`SELECT id, length, reason, notes, timestamp FROM cuts c WHERE c."rollId" =  ${id}`;
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
};

export const actions = {
	addCut: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;
		const length = data.get('length')?.valueOf() as string;
		const reason = data.get('reason')?.valueOf() as string;
		const notes = data.get('notes')?.valueOf() as string;

		try {
			const result =
				await db.sql`INSERT INTO cuts("rollId", length, reason, notes) VALUES (${id}, ${length}, ${reason}, ${notes})`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows updated when adding cut to ${id}`);
			}
		} catch (error) {
			return handleActionError(`error adding cut to ${id}`, error);
		}
	},
	deleteCut: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;
		try {
			const result = await db.sql`DELETE FROM cuts WHERE id = ${id}`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when deleting cut: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error deleting cut: ${id}`, error);
		}
	},

	returnRoll: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;

		try {
			const result = await db.sql`UPDATE rolls SET returned = true WHERE id = ${id}`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows updated when returning roll: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error returning roll: ${id}`, error);
		}
	},
	unReturnRoll: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;

		try {
			const result = await db.sql`UPDATE rolls SET returned = false WHERE id = ${id}`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows updated when unreturning roll: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error unreturning roll: ${id}`, error);
		}
	}
};
