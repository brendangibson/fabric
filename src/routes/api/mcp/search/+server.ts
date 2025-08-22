import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { query } = await request.json();

		if (!query) {
			return json(
				{
					error: true,
					message: 'Query is required',
					timestamp: new Date().toISOString()
				},
				{ status: 400 }
			);
		}

		// Parse natural language query
		const lowerQuery = query.toLowerCase();
		let style, colour, minStock, maxStock;

		// Style detection - actual fabric styles in your inventory
		if (lowerQuery.includes('cesta')) style = 'Cesta';
		if (lowerQuery.includes('cinta')) style = 'Cinta';
		if (lowerQuery.includes('cortina')) style = 'Cortina';
		if (lowerQuery.includes('floris')) style = 'Floris';
		if (lowerQuery.includes('hila')) style = 'Hila';
		if (lowerQuery.includes('lazo')) style = 'Lazo';
		if (lowerQuery.includes('lina')) style = 'Lina';
		if (lowerQuery.includes('onda')) style = 'Onda';
		if (lowerQuery.includes('oro')) style = 'Oro';
		if (lowerQuery.includes('pilar')) style = 'Pilar';
		if (lowerQuery.includes('pista')) style = 'Pista';
		if (lowerQuery.includes('pocu')) style = 'Pocu';
		if (lowerQuery.includes('sierra')) style = 'Sierra';
		if (lowerQuery.includes('suelo')) style = 'Suelo';
		if (lowerQuery.includes('traza')) style = 'Traza';

		// Colour detection - actual fabric colours in your inventory
		if (lowerQuery.includes('birch')) colour = 'Birch';
		if (lowerQuery.includes('burgundy')) colour = 'Burgundy';
		if (lowerQuery.includes('carbon')) colour = 'Carbon';
		if (lowerQuery.includes('charcoal')) colour = 'Charcoal';
		if (lowerQuery.includes('cloud')) colour = 'Cloud';
		if (lowerQuery.includes('coal')) colour = 'Coal';
		if (lowerQuery.includes('denim')) colour = 'Denim';
		if (lowerQuery.includes('dove')) colour = 'Dove';
		if (lowerQuery.includes('dune')) colour = 'Dune';
		if (lowerQuery.includes('dusty rose') || lowerQuery.includes('dustyrose'))
			colour = 'Dusty Rose';
		if (lowerQuery.includes('earth')) colour = 'Earth';
		if (lowerQuery.includes('fern')) colour = 'Fern';
		if (lowerQuery.includes('flax')) colour = 'Flax';
		if (lowerQuery.includes('granite')) colour = 'Granite';
		if (lowerQuery.includes('indigo')) colour = 'Indigo';
		if (lowerQuery.includes('linen')) colour = 'Linen';
		if (lowerQuery.includes('maize')) colour = 'Maize';
		if (lowerQuery.includes('mist')) colour = 'Mist';
		if (lowerQuery.includes('mustard')) colour = 'Mustard';
		if (lowerQuery.includes('neutral')) colour = 'Neutral';
		if (lowerQuery.includes('olive')) colour = 'Olive';
		if (lowerQuery.includes('onyx')) colour = 'Onyx';
		if (lowerQuery.includes('papyrus')) colour = 'Papyrus';
		if (lowerQuery.includes('pebble')) colour = 'Pebble';
		if (lowerQuery.includes('petrol')) colour = 'Petrol';
		if (lowerQuery.includes('poppy')) colour = 'Poppy';
		if (lowerQuery.includes('powder')) colour = 'Powder';
		if (lowerQuery.includes('putty')) colour = 'Putty';
		if (lowerQuery.includes('salt')) colour = 'Salt';
		if (lowerQuery.includes('sand')) colour = 'Sand';
		if (lowerQuery.includes('sea')) colour = 'Sea';
		if (lowerQuery.includes('sisal')) colour = 'Sisal';
		if (lowerQuery.includes('smoke')) colour = 'Smoke';
		if (lowerQuery.includes('snow')) colour = 'Snow';
		if (lowerQuery.includes('stone')) colour = 'Stone';
		if (lowerQuery.includes('surf')) colour = 'Surf';
		if (lowerQuery.includes('terracotta')) colour = 'Terracotta';

		// Stock level detection
		if (lowerQuery.includes('low stock') || lowerQuery.includes('out of stock')) {
			maxStock = 20;
		}
		if (lowerQuery.includes('high stock') || lowerQuery.includes('well stocked')) {
			minStock = 50;
		}

		// Build dynamic query based on parsed filters
		let sqlQuery;

		if (style && colour) {
			// Both style and colour specified
			sqlQuery = locals.db.sql`SELECT sc.id, s.name AS style, c.name AS colour
				FROM stylescolours sc, styles s, colours c 
				WHERE sc."colourId" = c.id AND sc."styleId" = s.id AND sc.hidden = false
				AND s.name = ${style} AND c.name = ${colour}
				ORDER BY style, colour LIMIT 20`;
		} else if (style) {
			// Only style specified
			sqlQuery = locals.db.sql`SELECT sc.id, s.name AS style, c.name AS colour
				FROM stylescolours sc, styles s, colours c 
				WHERE sc."colourId" = c.id AND sc."styleId" = s.id AND sc.hidden = false
				AND s.name = ${style}
				ORDER BY style, colour LIMIT 20`;
		} else if (colour) {
			// Only colour specified
			sqlQuery = locals.db.sql`SELECT sc.id, s.name AS style, c.name AS colour
				FROM stylescolours sc, styles s, colours c 
				WHERE sc."colourId" = c.id AND sc."styleId" = s.id AND sc.hidden = false
				AND c.name = ${colour}
				ORDER BY style, colour LIMIT 20`;
		} else {
			// No specific filters, return all with search relevance
			sqlQuery = locals.db.sql`SELECT sc.id, s.name AS style, c.name AS colour
				FROM stylescolours sc, styles s, colours c 
				WHERE sc."colourId" = c.id AND sc."styleId" = s.id AND sc.hidden = false
				ORDER BY style, colour LIMIT 20`;
		}

		const result = await sqlQuery;
		const rows = result.rows;

		return json({
			error: false,
			data: {
				query,
				results: rows,
				parsedFilters: { style, colour, minStock, maxStock },
				timestamp: new Date().toISOString()
			}
		});
	} catch (error) {
		console.error('Search error:', error);
		return json(
			{
				error: true,
				message: 'Failed to search inventory',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
