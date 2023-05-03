import type { QueryError } from '../../../../db';
import type { TStyleColour } from '../../../../fabric';

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

		const mainResult = await mainPromise;

		const remainingResult = await remainingPromise;

		const holdsLengthResult = await holdsLengthPromise;

		return {
			styleColour: {
				...mainResult?.rows?.[0],
				...remainingResult?.rows?.[0],
				...holdsLengthResult?.rows?.[0],
				...(await standbyLengthPromise)?.rows?.[0],
				...(await incomingLengthPromise)?.rows?.[0]
			}
		};
	} catch (error) {
		console.error('error getting styleColour: ', (error as QueryError).message);
		return { error: (error as QueryError)?.message ?? 'Error getting styleColour' };
	}
}
