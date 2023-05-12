import { fail, type RequestEvent } from '@sveltejs/kit';
import type { QueryError } from '../db';
import type { RouteParams } from '../routes/$types';
import { addWeeks } from 'date-fns';
import type { TSession } from '../app';

export const addHold = async (event: RequestEvent<RouteParams>) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id');
	const length = data.get('length');
	const owner = data.get('owner');
	const expires = data.get('expires');
	const notes = data.get('notes');
	const pending = Boolean(
		((await event.locals.getSession()) as TSession | null)?.user?.groups?.includes('trade')
	);

	console.log('pending: ', pending);

	try {
		const result = await db.query(
			`INSERT INTO holds("styleColourId", length, owner, expires, notes, pending) VALUES ($1, $2, $3, $4, $5, $6)`,
			[id, length, owner, expires, notes, pending]
		);
		if (result.rowCount !== 1) {
			return handleActionError(`no rows inserted when adding hold to ${id}`);
		}
	} catch (error) {
		return handleActionError(`error adding hold to ${id}`, error);
	}
};

export const approveHold = async (event: RequestEvent<RouteParams>) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id');

	try {
		const result = await db.query(`UPDATE holds SET pending=false WHERE id = $1`, [id]);
		if (result.rowCount !== 1) {
			console.error('result: ', result);
			return handleActionError(`no rows updated when approving hold: ${id}`);
		}
	} catch (error) {
		return handleActionError(`error deleting incoming: ${id}`, error);
	}
};

export const deleteHold = async (event: RequestEvent<RouteParams>) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id');
	try {
		const result = await db.query(`DELETE FROM holds WHERE id = $1`, [id]);
		if (result.rowCount !== 1) {
			return handleActionError(`no rows inserted when deleting hold: ${id}`);
		}
	} catch (error) {
		return handleActionError(`error deleting hold: ${id}`, error);
	}
};

export const updateHold = async (event: RequestEvent<RouteParams>) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id');
	const length = data.get('length');
	const owner = data.get('owner');
	const notes = data.get('notes');

	const expires =
		data.get('expires') !== null
			? new Date(data.get('expires') as string).toISOString()
			: addWeeks(new Date(), 2).toISOString();

	try {
		const result = await db.query(
			`UPDATE holds SET(length, expires, owner, notes) = ($2, $3, $4, $5) WHERE id = $1`,
			[id, length, expires, owner, notes]
		);
		if (result.rowCount !== 1) {
			return handleActionError(`no rows inserted when updating hold: ${id}`);
		}
	} catch (error) {
		return handleActionError(`error updating hold: ${id}`, error);
	}
};

export const handleActionError = (description: string, error?: unknown) => {
	const errorText = (error as QueryError)?.message ?? '';
	const errorMsg = description + (errorText ? ': ' + (error as QueryError)?.message : '');
	console.error(errorMsg, error);
	return fail(422, {
		error: errorMsg
	});
};
