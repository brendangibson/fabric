import type { TCut, TRoll, TStyleColour } from '../../../../../fabric';
import { addHold, deleteHold, handleActionError, updateHold } from '../../../../../db/actions';
import { handleLoadError } from '../../../../../db/load';

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
					FROM (SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, r."styleColourId" AS csi, r."originalLength" FROM rolls r
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
			`SELECT COALESCE(SUM(length),0) AS holdsLength FROM holds WHERE "styleColourId" = $1 AND expires > NOW()`,
			[id]
		);

		const incomingLengthPromise = db.query(
			`SELECT COALESCE(SUM(length),0) AS "incomingLength" FROM incoming WHERE "styleColourId" = $1`,
			[id]
		);

		const standbyLengthPromise = db.query<{ standbyLength: number }>(
			`SELECT COALESCE(SUM(length),0) AS standbyLength FROM standby WHERE "styleColourId" = $1`,
			[id]
		);

		const rollsPromise = db.query<TRoll>(
			`SELECT id, "glenRavenId", "originalLength", returned FROM rolls WHERE "styleColourId" = $1`,
			[id]
		);

		const cutsPromise = db.query<TCut>(
			`SELECT length, "rollId" FROM cuts c, rolls r WHERE c."rollId" = r.id AND r."styleColourId" = $1`,
			[id]
		);

		const incomingPromise = db.query<TCut>(`SELECT * FROM incoming WHERE  "styleColourId" = $1`, [
			id
		]);

		const holdsPromise = db.query<TCut>(`SELECT * FROM holds WHERE  "styleColourId" = $1`, [id]);

		const standbyPromise = db.query<TCut>(`SELECT * FROM standby WHERE  "styleColourId" = $1`, [
			id
		]);

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
	} catch (e) {
		handleLoadError(`error getting stylecolour ${id}`, e);
	}
}

export const actions = {
	addHold,
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
				`INSERT INTO incoming("styleColourId", length, expected) VALUES ($1, $2, $3)`,
				[id, length, expected]
			);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when adding incoming to ${id}`);
			}
		} catch (error) {
			return handleActionError(`error adding incomging to ${id}`, error);
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
				`INSERT INTO rolls("styleColourId", "originalLength", "glenRavenId", "shipmentId", notes) VALUES ($1, $2, $3, $4, $5)`,
				[id, length, glenRavenId, shipmentId, notes]
			);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when adding roll to ${id}`);
			}
		} catch (error) {
			return handleActionError(`error adding roll to ${id}`, error);
		}
	},
	addStandby: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');

		try {
			const result = await db.query(
				`INSERT INTO standby("styleColourId", length) VALUES ($1, $2)`,
				[id, length]
			);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when adding standby to ${id}`);
			}
		} catch (error) {
			return handleActionError(`error adding standby to ${id}`, error);
		}
	},
	approveHold: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');

		try {
			const result = await db.query(`UPDATE holds SET pending=false WHERE id = $1`, [id]);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when approving hold: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error deleting incoming: ${id}`, error);
		}
	},
	deleteHold,
	deleteIncoming: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		try {
			const result = await db.query(`DELETE FROM incoming WHERE id = $1`, [id]);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when deleting incoming: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error deleting incoming: ${id}`, error);
		}
	},
	deleteStandby: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		try {
			const result = await db.query(`DELETE FROM standby WHERE id = $1`, [id]);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when deleting standby: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error deleting incoming: ${id}`, error);
		}
	},
	updateHold,
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
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when incoming standby: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error updating incoming: ${id}`, error);
		}
	},
	updateStandby: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id');
		const length = data.get('length');

		try {
			const result = await db.query(`UPDATE standby SET length = $2 WHERE id = $1`, [id, length]);
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when updating standby: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error updating standby: ${id}`, error);
		}
	}
};
