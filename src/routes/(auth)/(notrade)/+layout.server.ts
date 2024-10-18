import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	const level = (await parent())?.user.level;

	if (!level || level === 'trade') redirect(307, '/summary');
};
