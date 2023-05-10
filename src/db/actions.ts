import { fail, type RequestEvent } from '@sveltejs/kit';
import type { QueryError } from '../db';
import type { RouteParams } from '../routes/$types';

export const addHold = async (event: RequestEvent<RouteParams>) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id');
	const length = data.get('length');
	const expires = data.get('expires');

	try {
		const result = await db.query(
			`INSERT INTO holds("styleColourId", length, expires) VALUES ($1, $2, $3)`,
			[id, length, expires]
		);
	} catch (error) {
		console.error('error adding hold: ', id, error, (error as QueryError)?.message);
		return fail(422, {
			description: data.get('description'),
			error: (error as QueryError)?.message
		});
	}
};

export const deleteHold = async (event: RequestEvent<RouteParams>) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id');
	try {
		await db.query(`DELETE FROM holds WHERE id = $1`, [id]);
	} catch (error) {
		console.error('error deleting hold: ', id, error);
		return fail(422, {
			description: data.get('description'),
			error: (error as QueryError)?.message
		});
	}
};

export const updateHold = async (event: RequestEvent<RouteParams>) => {
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
	} catch (error) {
		console.error('error updating hold: ', id, error);
		return fail(422, {
			description: data.get('description'),
			error: (error as QueryError)?.message
		});
	}
};