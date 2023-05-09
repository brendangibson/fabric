import { fail, type RequestEvent } from '@sveltejs/kit';
import type { QueryError } from '../db';
import type { RouteParams } from '../routes/$types';

export const addHold = async (event: RequestEvent<RouteParams>) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id');
	const length = data.get('length');
	const expires = data.get('expires');

	console.log('id: ', id, ' length: ', length);

	try {
		const result = await db.query(
			`INSERT INTO holds("styleColourId", length, expires) VALUES ($1, $2, $3)`,
			[id, length, expires]
		);
		console.log('INSERTED!', result);
	} catch (error) {
		console.error('error adding hold: ', id, error, (error as QueryError)?.message);
		return fail(422, {
			description: data.get('description'),
			error: (error as QueryError)?.message
		});
	}
};
