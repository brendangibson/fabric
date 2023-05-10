import { fail } from '@sveltejs/kit';
export const addHold = async (event) => {
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
		console.error('error adding hold: ', id, error, error?.message);
		return fail(422, {
			description: data.get('description'),
			error: error?.message
		});
	}
};
export const deleteHold = async (event) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id');
	try {
		await db.query(`DELETE FROM holds WHERE id = $1`, [id]);
	} catch (error) {
		console.error('error deleting hold: ', id, error);
		return fail(422, {
			description: data.get('description'),
			error: error?.message
		});
	}
};
export const updateHold = async (event) => {
	const data = await event.request.formData();
	const { db } = event.locals;
	const id = data.get('id');
	const length = data.get('length');
	const expires =
		data.get('expected') !== null
			? new Date(data.get('expires')).toISOString()
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
			error: error?.message
		});
	}
};
//# sourceMappingURL=actions.js.map
