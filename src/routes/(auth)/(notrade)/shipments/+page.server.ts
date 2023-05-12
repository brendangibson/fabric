import type { TShipment } from '../../../../fabric';
import { handleActionError } from '../../../../db/actions';
import { handleLoadError } from '../../../../db/load';

export async function load({ locals }) {
	const { db } = locals;
	try {
		const mainPromise = db.query<TShipment>(`SELECT * FROM shipments`);

		const mainResult = await mainPromise;

		const payload = {
			shipments: mainResult?.rows
		};

		return payload;
	} catch (e) {
		handleLoadError('error getting shipments', e);
	}
}

export const actions = {
	addShipment: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const name = data.get('name');
		const dateSent = data.get('dateSent') ? data.get('dateSent') : new Date().toISOString();
		const dateReceived = data.get('dateReceived')
			? data.get('dateReceived')
			: new Date().toISOString();
		const glenRavenId = data.get('glenRavenId');

		try {
			const result = await db.query(
				`INSERT INTO shipments(name, "dateSent", "dateReceived", "glenRavenId") VALUES ($1, $2, $3, $4)`,
				[name, dateSent, dateReceived, glenRavenId]
			);
			if (result.rowCount !== 1) {
				return handleActionError('no rows inserted when adding shipment');
			}
		} catch (error) {
			return handleActionError('error adding shipment', error);
		}
	}
};
