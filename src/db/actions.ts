import { fail, type RequestEvent } from '@sveltejs/kit';
import type { QueryError } from '../db';
import type { RouteParams } from '../routes/$types';
import { addWeeks } from 'date-fns';

export const addHold = async (event: RequestEvent<RouteParams>) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id')?.valueOf() as string;
	const length = data.get('length')?.valueOf() as string;
	const owner = data.get('owner')?.valueOf() as string;
	const expires = data.get('expires')?.valueOf() as string;
	const notes = data.get('notes')?.valueOf() as string;
	const pending = event.locals.session.claims.org_role !== 'org:admin';

	try {
		const result =
			await db.sql`INSERT INTO holds("styleColourId", length, owner, expires, notes, pending) VALUES (${id}, ${length}, ${owner}, ${expires}, ${notes}, ${pending})`;

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
	const id = data.get('id')?.valueOf() as string;

	try {
		const result = await db.sql`UPDATE holds SET pending=false WHERE id = ${id}`;
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
	const id = data.get('id')?.valueOf() as string;
	try {
		const result = await db.sql`DELETE FROM holds WHERE id = ${id}`;
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
	const id = data.get('id')?.valueOf() as string;
	const length = data.get('length')?.valueOf() as string;
	const owner = data.get('owner')?.valueOf() as string;
	const notes = data.get('notes')?.valueOf() as string;

	const expires =
		data.get('expires') !== null
			? new Date(data.get('expires') as string).toISOString()
			: addWeeks(new Date(), 2).toISOString();

	try {
		const result =
			await db.sql`UPDATE holds SET(length, expires, owner, notes) = (${length}, ${expires}, ${owner}, ${notes}) WHERE id = ${id}`;
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
