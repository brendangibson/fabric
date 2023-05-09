import { fail } from '@sveltejs/kit';
import type { QueryError } from '../../../db';
import type { TShipment } from '../../../fabric';

export async function load({ locals }) {
	const { db } = locals;
	try {
		const mainPromise = db.query<TShipment>(`SELECT * FROM shipments`);

		const mainResult = await mainPromise;

		const payload = {
			shipments: mainResult?.rows
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
	addShipment: async (event) => {
		const data = await event.request.formData();
		const { db } = event.locals;
		const name = data.get('name');
		const dateSent = data.get('dateSent');
		const dateReceived = data.get('dateReceived');
		const glenRavenId = data.get('glenRavenId');

		try {
			const result = await db.query(
				`INSERT INTO shipments(name, "dateSent", "dateReceived", "glenRavenId") VALUES ($1, $2, $3, $4)`,
				[name, dateSent, dateReceived, glenRavenId]
			);
			console.log('INSERTED!', result);
		} catch (error) {
			console.error('error adding shipment: ', error, (error as QueryError)?.message);
			return fail(422, {
				description: data.get('description'),
				error: (error as QueryError)?.message
			});
		}
	}
};
