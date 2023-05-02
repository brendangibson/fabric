import { createPool } from '@vercel/postgres';
import { POSTGRES_URL, AUTH_SECRET } from '$env/static/private';

export async function load() {
	console.log('page.server.ts');
	console.log(
		'POSTGRES_URL: ',
		POSTGRES_URL,
		process.env.POSTGRES_URL,
		import.meta.env.POSTGRES_URL,
		process.env.AUTH_SECRET,
		AUTH_SECRET
	);

	try {
		const db = createPool({ connectionString: POSTGRES_URL });
		const { rows: colours } = await db.query(`SELECT * FROM colours`);
		return {
			colours
		};
	} catch (error) {
		console.error('error: ', error);
	}
}
