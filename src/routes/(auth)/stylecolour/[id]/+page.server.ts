import { fail } from '@sveltejs/kit';
import type { QueryError } from '../../../../db';
import type { TCut, TRoll, TStyleColour } from '../../../../fabric';
import { identity } from 'svelte/internal';

export async function load({ locals, params }) {
	const { db } = locals;
	const id = params.id;
	try {
		const mainPromise = db.query<TStyleColour>(
			`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour, "glenRavenName",
			s.weight, s.thickness
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
			`SELECT id, length, expected, "orderId" FROM incoming WHERE  "colourStyleId" = $1`,
			[id]
		);

		const holdsPromise = db.query<TCut>(
			`SELECT id, length, owner, expires, timestamp, "orderId" FROM holds WHERE  "colourStyleId" = $1`,
			[id]
		);

		const standbyPromise = db.query<TCut>(
			`SELECT id, length,timestamp FROM standby WHERE  "colourStyleId" = $1`,
			[id]
		);

		const shipmentsPromise = db.query<TStyleColour>(
			`SELECT id, name FROM shipments ORDER BY "dateReceived" DESC LIMIT 10`
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
				...{ incoming: (await incomingPromise)?.rows },
				...{ holds: (await holdsPromise)?.rows },
				...{ standby: (await standbyPromise)?.rows }
			},
			shipments: (await shipmentsPromise)?.rows
		};
	} catch (error) {
		return fail(422, {
			error: (error as QueryError)?.message
		});
	}
}

export const actions = {
	addHold: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');

		try {
			const result = await db.query(`INSERT INTO holds("colourStyleId", length) VALUES ($1, $2)`, [
				id,
				length
			]);
			console.log('INSERTED!', result);
		} catch (error) {
			console.error('error adding hold: ', id, error, (error as QueryError)?.message);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	addIncoming: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');
		const expected =
			data.get('expected') !== null
				? new Date(data.get('expected') as string).toISOString()
				: new Date().toISOString();

		try {
			const result = await db.query(
				`INSERT INTO incoming("colourStyleId", length, expected) VALUES ($1, $2, $3)`,
				[id, length, expected]
			);
			console.log('INSERTED!', result);
		} catch (error) {
			console.error('error updating incoming: ', id, error);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	addRoll: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');
		const glenRavenId = data.get('glenRavenId');
		const shipmentId = data.get('shipmentId');
		const notes = data.get('notes');

		try {
			const result = await db.query(
				`INSERT INTO rolls("colourStyleId", "originalLength", "glenRavenId", "shipmentId", notes) VALUES ($1, $2, $3, $4, $5)`,
				[id, length, glenRavenId, shipmentId, notes]
			);
			console.log('ADDED!', result);
		} catch (error) {
			console.error('error adding roll: ', id, error);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	addStandby: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');

		try {
			const result = await db.query(
				`INSERT INTO standby("colourStyleId", length) VALUES ($1, $2)`,
				[id, length]
			);
			console.log('INSERTED!', result);
		} catch (error) {
			console.error('error adding standby: ', id, error, (error as QueryError)?.message);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	approveHold: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');

		try {
			const result = await db.query(`UPDATE holds SET pending=false WHERE id = $1`, [identity]);
			console.log('APPROVED!', result);
		} catch (error) {
			console.error('error approving hold: ', id, error);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	deleteHold: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		try {
			await db.query(`DELETE FROM holds WHERE id = $1`, [id]);
			console.log('DELETED!');
		} catch (error) {
			console.error('error deleting hold: ', id, error);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	deleteIncoming: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		try {
			await db.query(`DELETE FROM incoming WHERE id = $1`, [id]);
			console.log('DELETED!');
		} catch (error) {
			console.error('error deleting incoming: ', id, error);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	deleteStandby: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		console.log('id: ', id);
		try {
			const result = await db.query(`DELETE FROM standby WHERE id = $1`, [id]);
			console.log('DELETED!', result);
			if (result.rowCount === 0) {
				return fail(422, {
					description: data.get('description'),
					error: 'Deleting standby failed'
				});
			}
		} catch (error) {
			console.error('error deleting standby: ', id, error);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	updateHold: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');
		const expires =
			data.get('expected') !== null
				? new Date(data.get('expires') as string).toISOString()
				: new Date().toISOString();

		try {
			const result = await db.query(`UPDATE holds SET(length, expires) = ($2, $3) WHERE id = $1`, [
				id,
				length,
				expires
			]);
			console.log('UPDATED!', result);
		} catch (error) {
			console.error('error updating hold: ', id, error);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	updateIncoming: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');
		const expected =
			data.get('expected') !== null
				? new Date(data.get('expected') as string).toISOString()
				: new Date().toISOString();

		try {
			const result = await db.query(
				`UPDATE incoming SET(length, expected) = ($2, $3) WHERE id = $1`,
				[id, length, expected]
			);
			console.log('UPDATED!', result);
		} catch (error) {
			console.error('error updating incoming: ', id, error);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	},
	updateStandby: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');

		try {
			const result = await db.query(`UPDATE standby SET length = $2 WHERE id = $1`, [id, length]);
			console.log('UPDATED!', result);
		} catch (error) {
			console.error('error updating standby: ', id, error);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	}
};
