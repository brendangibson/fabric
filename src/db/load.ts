import type { QueryError } from '../db';
import { error } from '@sveltejs/kit';

export const handleLoadError = (description: string, e: unknown) => {
	const errorMsg = description + ': ' + (e as QueryError)?.message;
	error(500, errorMsg);
};
