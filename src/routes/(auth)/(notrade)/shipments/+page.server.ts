import { handleActionError } from '../../../../db/actions';
import { handleLoadError } from '../../../../db/load';
import type { PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { db } = locals;
	try {
		const mainPromise = db.sql`SELECT * FROM shipments`;

		const mainResult = await mainPromise;

		const payload = {
			shipments: mainResult?.rows
		};

		return payload;
	} catch (e) {
		handleLoadError('error getting shipments', e);
	}
};

export const actions = {
	addShipment: async (event: RequestEvent) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const name = data.get('name')?.valueOf() as string;
		const dateSent = data.get('dateSent')
			? (data.get('dateSent')?.valueOf() as string)
			: new Date().toISOString();
		const dateReceived = data.get('dateReceived')
			? (data.get('dateReceived')?.valueOf() as string)
			: new Date().toISOString();
		const glenRavenId = data.get('glenRavenId')?.valueOf() as string;

		try {
			const result =
				await db.sql`INSERT INTO shipments(name, "dateSent", "dateReceived", "glenRavenId") VALUES (${name}, ${dateSent}, ${dateReceived}, ${glenRavenId})`;

			if (result.rowCount !== 1) {
				return handleActionError('no rows inserted when adding shipment');
			}
		} catch (error) {
			return handleActionError('error adding shipment', error);
		}
	}
};
