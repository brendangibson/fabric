export async function load({ locals, params }) {
	const { db } = locals;
	const id = params.id;
	try {
		const { rows: styleColour } = await db.query(
			`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour FROM stylescolours sc, styles s, colours c WHERE sc."colourId" = c.id and sc."styleId" = s.id AND sc.id='${id}'`
		);
		return {
			styleColour
		};
	} catch (error) {
		console.error('error: ', error);
	}
}
