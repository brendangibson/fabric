import { redirect } from '@sveltejs/kit';
import type { TSession } from '../../../app';

export const load = async ({ locals, parent }) => {

	const level = (await parent())?.user.level

	if (!level || level === 'trade') throw redirect(307, '/summary');

};
