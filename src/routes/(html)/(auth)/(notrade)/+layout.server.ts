import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (locals.session?.claims.org_role !== 'org:admin') redirect(307, '/summary');
};
