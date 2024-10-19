import type { TCut, TRoll, TShipment, TStyleColour } from '../../../../../fabric';
import { addHold, deleteHold, handleActionError, updateHold } from '../../../../../db/actions';
import { handleLoadError } from '../../../../../db/load';
import type { QueryResultRow } from '@vercel/postgres';
import type { LayoutServerLoad } from '../../$types';
import type { RequestEvent } from './$types.js';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { db } = locals;
	const id = params.id;
	try {
		const mainPromise: QueryResultRow<TStyleColour> = db.sql`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour, "glenRavenName",
			s.weight, s.thickness
			FROM stylescolours sc, styles s, colours c 
			WHERE sc."colourId" = c.id and sc."styleId" = s.id AND sc.id=${id}`;

		const remainingPromise: QueryResultRow<{ remaining: number }> = db.sql`SELECT COALESCE(
				(
					SELECT SUM(CASE WHEN i.length > 1 THEN i.length ELSE 0 END)
					FROM (SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, r."styleColourId" AS csi, r."originalLength" FROM rolls r
					LEFT JOIN cuts c ON r.id = c."rollId"
					WHERE NOT r.returned GROUP BY r.id
				) AS i
				WHERE i.csi = ${id}
				GROUP BY i.csi
			),0)
			AS remaining`;

		const holdsLengthPromise: QueryResultRow<{ holdsLength: number }> =
			db.sql`SELECT COALESCE(SUM(length),0) AS holdsLength FROM holds WHERE "styleColourId" = ${id} AND expires > NOW()`;

		const incomingLengthPromise = db.sql`SELECT COALESCE(SUM(length),0) AS "incomingLength" FROM incoming WHERE "styleColourId" = ${id}`;

		const standbyLengthPromise: QueryResultRow<{ standbyLength: number }> =
			db.sql`SELECT COALESCE(SUM(length),0) AS standbyLength FROM standby WHERE "styleColourId" = ${id}`;

		const rollsPromise: QueryResultRow<TRoll> = db.sql`SELECT id, "glenRavenId", "originalLength", returned FROM rolls WHERE "styleColourId" = ${id}`;

		const cutsPromise: QueryResultRow<TCut> = db.sql`SELECT length, "rollId" FROM cuts c, rolls r WHERE c."rollId" = r.id AND r."styleColourId" = ${id}`;

		const incomingPromise: QueryResultRow<TCut> = db.sql`SELECT * FROM incoming WHERE  "styleColourId" = ${id}`;

		const holdsPromise: QueryResultRow<TCut> = db.sql`SELECT * FROM holds WHERE  "styleColourId" = ${id}`;

		const standbyPromise: QueryResultRow<TCut> = db.sql`SELECT * FROM standby WHERE  "styleColourId" = ${id}`;

		const shipmentsPromise: QueryResultRow<TShipment> = db.sql`SELECT id, name FROM shipments ORDER BY "dateReceived" DESC LIMIT 10`;

		const mainResult = await mainPromise;
		const remainingResult = await remainingPromise;
		const holdsLengthResult = await holdsLengthPromise;

		const cutsResult = (await cutsPromise).rows as TCut[];
		const rollsResult = (await rollsPromise).rows as TRoll[];

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
};

export const actions = {
	addHold,
	addIncoming: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;
		const length = data.get('length')?.valueOf() as string;
		const expected =
			data.get('expected') !== null
				? new Date(data.get('expected') as string).toISOString()
				: new Date().toISOString();

		try {
			const result =
				await db.sql`INSERT INTO incoming("styleColourId", length, expected) VALUES (${id}, ${length}, ${expected})`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when adding incoming to ${id}`);
			}
		} catch (error) {
			return handleActionError(`error adding incomging to ${id}`, error);
		}
	},
	addRoll: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;
		const length = data.get('length')?.valueOf() as string;
		const glenRavenId = data.get('glenRavenId')?.valueOf() as string;
		const shipmentId = data.get('shipmentId')?.valueOf() as string;
		const notes = data.get('notes')?.valueOf() as string;

		try {
			const result =
				await db.sql`INSERT INTO rolls("styleColourId", "originalLength", "glenRavenId", "shipmentId", notes) VALUES (${id}, ${length}, ${glenRavenId}, ${shipmentId}, ${notes})`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when adding roll to ${id}`);
			}
		} catch (error) {
			return handleActionError(`error adding roll to ${id}`, error);
		}
	},
	addStandby: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;
		const length = data.get('length')?.valueOf() as string;

		try {
			const result =
				await db.sql`INSERT INTO standby("styleColourId", length) VALUES (${id}, ${length})`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when adding standby to ${id}`);
			}
		} catch (error) {
			return handleActionError(`error adding standby to ${id}`, error);
		}
	},
	approveHold: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;

		try {
			const result = await db.sql`UPDATE holds SET pending=false WHERE id = ${id}`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when approving hold: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error deleting incoming: ${id}`, error);
		}
	},
	deleteHold,
	deleteIncoming: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;
		try {
			const result = await db.sql`DELETE FROM incoming WHERE id = ${id}`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when deleting incoming: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error deleting incoming: ${id}`, error);
		}
	},
	deleteStandby: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;
		try {
			const result = await db.sql`DELETE FROM standby WHERE id = ${id}`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when deleting standby: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error deleting incoming: ${id}`, error);
		}
	},
	updateHold,
	updateIncoming: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;
		const length = data.get('length')?.valueOf() as string;
		const expected =
			data.get('expected') !== null
				? new Date(data.get('expected') as string).toISOString()
				: new Date().toISOString();

		try {
			const result =
				await db.sql`UPDATE incoming SET(length, expected) = (${length}, ${expected}) WHERE id = ${id}`;

			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when incoming standby: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error updating incoming: ${id}`, error);
		}
	},
	updateStandby: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const id = data.get('id')?.valueOf() as string;
		const length = data.get('length')?.valueOf() as string;

		try {
			const result = await db.sql`UPDATE standby SET length = ${length} WHERE id = ${id}`;
			if (result.rowCount !== 1) {
				return handleActionError(`no rows inserted when updating standby: ${id}`);
			}
		} catch (error) {
			return handleActionError(`error updating standby: ${id}`, error);
		}
	}
};
