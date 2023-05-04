import { db } from '@vercel/postgres';
import type { QueryError } from '../../../../db';
import type { TCut, TRoll, TStyleColour } from '../../../../fabric';

export async function load({ locals, params }) {
	const { db } = locals;
	const id = params.id;
	try {
		const mainPromise = db.query<TStyleColour>(
			`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour, "glenRavenName"
			FROM stylescolours sc, styles s, colours c 
			WHERE sc."colourId" = c.id and sc."styleId" = s.id AND sc.id=$1`,
			[id]
		);

		const remainingPromise = db.query<{ remaining: number }>(
			`SELECT COALESCE(
				(
					SELECT SUM(CASE WHEN i.length > 1 THEN i.length ELSE 0 END)
					FROM (SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, r."colourStyleId" AS csi, r."originalLength" FROM rolls r
					LEFT JOIN cuts c ON r.id = c."rollId"
					WHERE NOT r.returned GROUP BY r.id
				) AS i
				WHERE i.csi = $1
				GROUP BY i.csi
			),0)
			AS remaining`,
			[id]
		);

		const holdsLengthPromise = db.query<{ holdsLength: number }>(
			`SELECT COALESCE(SUM(length),0) AS holdsLength FROM holds WHERE "colourStyleId" = $1 AND expires > NOW()`,
			[id]
		);

		const incomingLengthPromise = db.query<{ incomingLength: number }>(
			`SELECT COALESCE(SUM(length),0) AS incomingLength FROM incoming WHERE "colourStyleId" = $1`,
			[id]
		);

		const standbyLengthPromise = db.query<{ standbyLength: number }>(
			`SELECT COALESCE(SUM(length),0) AS standbyLength FROM standby WHERE "colourStyleId" = $1`,
			[id]
		);

		const rollsPromise = db.query<TRoll>(
			`SELECT id, "glenRavenId", "originalLength", returned FROM rolls WHERE "colourStyleId" = $1`,
			[id]
		);

		const cutsPromise = db.query<TCut>(
			`SELECT length, "rollId" FROM cuts c, rolls r WHERE c."rollId" = r.id AND r."colourStyleId" = $1`,
			[id]
		);

		const incomingPromise = db.query<TCut>(
			`SELECT id,  length,expected,"orderId" FROM incoming WHERE  "colourStyleId" = $1`,
			[id]
		);

		const mainResult = await mainPromise;
		const remainingResult = await remainingPromise;
		const holdsLengthResult = await holdsLengthPromise;

		const cutsResult = (await cutsPromise).rows;
		const rollsResult = (await rollsPromise).rows;

		const rolls = rollsResult.map((roll) => {
			return {
				...roll,
				cuts: cutsResult.filter((cut) => cut.rollId === roll.id)
			};
		});

		return {
			styleColour: {
				...mainResult?.rows?.[0],
				...remainingResult?.rows?.[0],
				...holdsLengthResult?.rows?.[0],
				...(await standbyLengthPromise)?.rows?.[0],
				...(await incomingLengthPromise)?.rows?.[0],
				...{ rolls },
				...{ incoming: (await incomingPromise)?.rows }
			}
		};
	} catch (error) {
		console.error('error getting styleColour: ', (error as QueryError).message);
		return { error: (error as QueryError)?.message ?? 'Error getting styleColour' };
	}
}

export const actions = {
	deleteIncoming: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		console.log('id: ', id);
		try {
			await db.query(`DELETE FROM incoming WHERE id = $1`, [id]);
			console.log('DELETED!');
		} catch (error) {
			console.error('error deleting incoming: ', id, error);
		}
	}
};
