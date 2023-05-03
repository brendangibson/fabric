export async function load({ locals }) {
	const { db } = locals;
	try {
		const { rows: stylesColours } = await db.query(
			`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour FROM stylescolours sc, styles s, colours c WHERE sc."colourId" = c.id and sc."styleId" = s.id ORDER BY style, colour`
		);
		return {
			stylesColours
		};
	} catch (error) {
		console.error('error: ', error);
	}
}
