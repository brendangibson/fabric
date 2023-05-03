export async function load({ locals }) {
	const { db } = locals;
	try {
		const { rows: colours } = await db.query(`SELECT * FROM colours`);
		return {
			colours
		};
	} catch (error) {
		console.error('error: ', error);
	}
}
