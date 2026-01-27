import { SHOPIFY_STORE_URL, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, SHOPIFY_LOCATION_ID } from '$env/static/private';
import { minRollSize } from '$src/constants';
import type { VercelPool } from '@vercel/postgres';

// Cache for access token (expires in ~24 hours)
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get an access token using OAuth client credentials flow
 * Tokens are cached and automatically refreshed when expired
 */
async function getAccessToken(): Promise<string | null> {
	if (!SHOPIFY_STORE_URL || !SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
		console.warn('Shopify credentials not configured');
		return null;
	}

	// Return cached token if still valid (with 5 minute buffer)
	if (cachedAccessToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
		return cachedAccessToken;
	}

	try {
		const url = `${SHOPIFY_STORE_URL}/admin/oauth/access_token`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: SHOPIFY_CLIENT_ID,
				client_secret: SHOPIFY_CLIENT_SECRET,
				grant_type: 'client_credentials'
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`Shopify OAuth error: ${response.status} ${response.statusText}`, errorText);
			return null;
		}

		const data = await response.json();
		
		if (!data.access_token) {
			console.error('No access token in Shopify OAuth response');
			return null;
		}

		// Cache the token (expires_in is in seconds, typically 86399 = ~24 hours)
		cachedAccessToken = data.access_token;
		const expiresIn = data.expires_in || 86399;
		tokenExpiresAt = Date.now() + expiresIn * 1000;

		console.log('Successfully obtained Shopify access token');
		return cachedAccessToken;
	} catch (error) {
		console.error('Error getting Shopify access token:', error);
		return null;
	}
}

/**
 * Get the SKU for a given styleColourId
 */
export async function getSkuForStyleColour(
	db: VercelPool,
	styleColourId: string
): Promise<string | null> {
	try {
		const result = await db.sql`SELECT sku FROM stylescolours WHERE id = ${styleColourId}`;
		const sku = result.rows[0]?.sku;
		return sku || null;
	} catch (error) {
		console.error('Error getting SKU for styleColourId:', error);
		return null;
	}
}

/**
 * Calculate the current available quantity (in yards) for a given styleColourId
 * This is: remaining roll length (minus cuts) minus holds (that haven't expired)
 */
export async function calculateQuantityForStyleColour(
	db: VercelPool,
	styleColourId: string
): Promise<number> {
	try {
		const result = await db.sql`SELECT 
			COALESCE(
				(
					SELECT SUM(CASE WHEN i.length > ${minRollSize} THEN i.length ELSE 0 END)
					FROM (
						SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, 
							r."styleColourId" AS csi, 
							r."originalLength" 
						FROM rolls r
						LEFT JOIN cuts c ON r.id = c."rollId"
						WHERE NOT r.returned 
						GROUP BY r.id
					) AS i
					WHERE i.csi = ${styleColourId}
					GROUP BY i.csi
				),0
			) - COALESCE(
				(SELECT SUM(length) FROM holds WHERE "styleColourId" = ${styleColourId} AND expires > NOW()),
				0
			)
		AS available`;

		const available = result.rows[0]?.available || 0;
		// Round down to nearest 5 yards (e.g., 28 → 25, 24 → 20, 4 → 0)
		// If less than 5 yards, return 0. Never return less than 0.
		const roundedDown = Math.floor(available / 5) * 5;
		return Math.max(0, roundedDown);
	} catch (error) {
		console.error('Error calculating quantity for styleColourId:', error);
		return 0;
	}
}

/**
 * Find a Shopify product variant by SKU using GraphQL API
 */
async function findProductVariantBySku(sku: string): Promise<{ variantId: string; inventoryItemId: string } | null> {
	const accessToken = await getAccessToken();
	if (!accessToken) {
		return null;
	}

	try {
		// Use GraphQL to search for variant by SKU
		const query = `
			query getVariantBySku($query: String!) {
				productVariants(first: 1, query: $query) {
					edges {
						node {
							id
							inventoryItem {
								id
							}
						}
					}
				}
			}
		`;

		const variables = {
			query: `sku:'${sku}'`
		};

		const url = `${SHOPIFY_STORE_URL}/admin/api/2024-01/graphql.json`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'X-Shopify-Access-Token': accessToken,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query, variables })
		});

		if (!response.ok) {
			console.error(`Shopify API error: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();
		
		if (data.errors) {
			console.error('Shopify GraphQL errors:', data.errors);
			return null;
		}

		const edges = data.data?.productVariants?.edges || [];
		
		if (edges.length === 0) {
			console.warn(`No variant found with SKU: ${sku}`);
			return null;
		}

		const variant = edges[0].node;
		// Extract numeric ID from GID (format: "gid://shopify/ProductVariant/123456")
		const variantId = variant.id.split('/').pop();
		const inventoryItemId = variant.inventoryItem.id.split('/').pop();

		return {
			variantId,
			inventoryItemId
		};
	} catch (error) {
		console.error('Error finding Shopify product variant:', error);
		return null;
	}
}

/**
 * Update inventory quantity in Shopify for a given SKU
 */
async function updateShopifyInventory(sku: string, quantity: number): Promise<boolean> {
	const accessToken = await getAccessToken();
	if (!accessToken) {
		console.warn('Shopify credentials not configured, skipping inventory update');
		return false;
	}

	try {
		// Find the product variant by SKU
		const variantInfo = await findProductVariantBySku(sku);
		if (!variantInfo) {
			console.warn(`Cannot update Shopify inventory: product variant not found for SKU ${sku}`);
			return false;
		}

		// Get location ID
		const locationId = await getShopifyLocationId(accessToken);
		if (!locationId) {
			console.warn('Cannot update Shopify inventory: location ID not found');
			return false;
		}

		// Update inventory level using the inventory item ID
		const url = `${SHOPIFY_STORE_URL}/admin/api/2024-01/inventory_levels/set.json`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'X-Shopify-Access-Token': accessToken,
				'Content-Type': 'application/json'
			},
		body: JSON.stringify({
			inventory_item_id: variantInfo.inventoryItemId,
			location_id: locationId,
			available: quantity // Quantity is already rounded down to nearest 5 yards
		})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`Shopify inventory update failed: ${response.status} ${response.statusText}`, errorText);
			return false;
		}

		console.log(`Successfully updated Shopify inventory for SKU ${sku} to ${quantity}`);
		return true;
	} catch (error) {
		console.error('Error updating Shopify inventory:', error);
		return false;
	}
}

/**
 * Get the Shopify location ID
 * First checks environment variable, then falls back to fetching the first available location
 */
async function getShopifyLocationId(accessToken: string): Promise<string | null> {
	// Use environment variable if set
	if (SHOPIFY_LOCATION_ID) {
		return SHOPIFY_LOCATION_ID;
	}

	if (!SHOPIFY_STORE_URL) {
		return null;
	}

	try {
		const url = `${SHOPIFY_STORE_URL}/admin/api/2024-01/locations.json?limit=1`;
		const response = await fetch(url, {
			headers: {
				'X-Shopify-Access-Token': accessToken,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			console.error(`Shopify API error getting location: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();
		const locations = data.locations || [];
		
		if (locations.length === 0) {
			console.error('No Shopify locations found');
			return null;
		}

		return locations[0].id.toString();
	} catch (error) {
		console.error('Error getting Shopify location ID:', error);
		return null;
	}
}

/**
 * Sync quantity to Shopify for a given styleColourId
 * This is the main function to call after any quantity-changing operation
 */
export async function syncQuantityToShopify(
	db: VercelPool,
	styleColourId: string
): Promise<void> {
	try {
		// Get SKU for this styleColourId
		const sku = await getSkuForStyleColour(db, styleColourId);
		if (!sku) {
			console.warn(`No SKU found for styleColourId ${styleColourId}, skipping Shopify sync`);
			return;
		}

		// Calculate current quantity
		const quantity = await calculateQuantityForStyleColour(db, styleColourId);

		// Update Shopify
		await updateShopifyInventory(sku, quantity);
	} catch (error) {
		console.error('Error syncing quantity to Shopify:', error);
		// Don't throw - we don't want to fail the main operation if Shopify sync fails
	}
}
