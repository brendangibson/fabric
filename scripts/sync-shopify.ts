#!/usr/bin/env node
/**
 * Script to sync all current fabric quantities to Shopify
 * 
 * Usage:
 *   npm run sync-shopify
 *   or
 *   npx tsx scripts/sync-shopify.ts
 * 
 * Make sure your .env file is loaded or environment variables are set:
 *   - POSTGRES_URL
 *   - SHOPIFY_STORE_URL
 *   - SHOPIFY_CLIENT_ID
 *   - SHOPIFY_CLIENT_SECRET
 *   - SHOPIFY_LOCATION_ID (optional)
 */

import { createPool } from '@vercel/postgres';
import type { VercelPool } from '@vercel/postgres';

// Load environment variables from .env file if available
try {
	const dotenv = await import('dotenv');
	dotenv.config();
} catch {
	// dotenv not available, assume env vars are set in environment
}

// Get environment variables
const POSTGRES_URL = process.env.POSTGRES_URL;
let SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_LOCATION_ID = process.env.SHOPIFY_LOCATION_ID;
const minRollSize = 0.5;

// Check environment variables
if (!POSTGRES_URL) {
	console.error('❌ POSTGRES_URL environment variable is not set');
	process.exit(1);
}

if (!SHOPIFY_STORE_URL || !SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
	console.error('❌ Shopify environment variables are not set');
	console.error('   Required: SHOPIFY_STORE_URL, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET');
	process.exit(1);
}

// Normalize SHOPIFY_STORE_URL (remove trailing slash, ensure https)
SHOPIFY_STORE_URL = SHOPIFY_STORE_URL.replace(/\/$/, ''); // Remove trailing slash
if (!SHOPIFY_STORE_URL.startsWith('http')) {
	SHOPIFY_STORE_URL = `https://${SHOPIFY_STORE_URL}`;
}

// For Admin API, Shopify requires the .myshopify.com domain
// If a custom domain is provided, we'll try to convert it, but the user should use myshopify.com
// Note: This is a best-effort conversion - the user should ideally set the myshopify.com domain
if (!SHOPIFY_STORE_URL.includes('.myshopify.com')) {
	console.warn('⚠️  Warning: SHOPIFY_STORE_URL uses a custom domain.');
	console.warn('   Shopify Admin API requires the .myshopify.com domain for OAuth.');
	console.warn('   If OAuth fails, try using: https://your-store.myshopify.com');
	console.warn(`   Current URL: ${SHOPIFY_STORE_URL}\n`);
}

// Shopify OAuth token cache
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get an access token using OAuth client credentials flow
 */
async function getAccessToken(): Promise<string | null> {
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
			
			// Check if we got HTML (404 page) instead of JSON
			if (errorText.trim().startsWith('<!') || errorText.includes('<html')) {
				console.error(`❌ Shopify OAuth error: ${response.status} ${response.statusText}`);
				console.error(`   The store URL "${SHOPIFY_STORE_URL}" appears to be incorrect or the store doesn't exist.`);
				console.error(`   Make sure SHOPIFY_STORE_URL is in the format: https://your-store-name.myshopify.com`);
				console.error(`   Current URL: ${SHOPIFY_STORE_URL}/admin/oauth/access_token`);
			} else {
				console.error(`Shopify OAuth error: ${response.status} ${response.statusText}`);
				try {
					const errorJson = JSON.parse(errorText);
					console.error('   Error details:', errorJson);
				} catch {
					console.error('   Response:', errorText.substring(0, 200));
				}
			}
			return null;
		}

		const data = await response.json();
		
		if (!data.access_token) {
			console.error('No access token in Shopify OAuth response');
			return null;
		}

		cachedAccessToken = data.access_token;
		const expiresIn = data.expires_in || 86399;
		tokenExpiresAt = Date.now() + expiresIn * 1000;

		return cachedAccessToken;
	} catch (error) {
		console.error('Error getting Shopify access token:', error);
		return null;
	}
}

/**
 * Calculate the current available quantity for a styleColourId
 */
async function calculateQuantity(db: VercelPool, styleColourId: string): Promise<number> {
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
		console.error('Error calculating quantity:', error);
		return 0;
	}
}

/**
 * Find Shopify variant by SKU
 */
async function findVariantBySku(sku: string, accessToken: string): Promise<{ variantId: string; inventoryItemId: string } | null> {
	try {
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

		const url = `${SHOPIFY_STORE_URL}/admin/api/2024-01/graphql.json`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'X-Shopify-Access-Token': accessToken,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query,
				variables: { query: `sku:'${sku}'` }
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`GraphQL request failed: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
		}

		const data = await response.json();
		
		if (data.errors) {
			throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
		}

		if (!data.data?.productVariants?.edges?.length) {
			throw new Error(`No variant found with SKU: ${sku}`);
		}

		const variant = data.data.productVariants.edges[0].node;
		const variantId = variant.id.split('/').pop();
		const inventoryItemId = variant.inventoryItem.id.split('/').pop();

		return { variantId, inventoryItemId };
	} catch (error) {
		throw error;
	}
}

/**
 * Get Shopify location ID
 */
async function getLocationId(accessToken: string): Promise<string | null> {
	if (SHOPIFY_LOCATION_ID) {
		return SHOPIFY_LOCATION_ID;
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
			return null;
		}

		const data = await response.json();
		return data.locations?.[0]?.id?.toString() || null;
	} catch (error) {
		return null;
	}
}

/**
 * Enable inventory tracking for a variant
 */
async function enableInventoryTracking(variantId: string, accessToken: string): Promise<void> {
	const mutation = `
		mutation productVariantUpdate($input: ProductVariantInput!) {
			productVariantUpdate(input: $input) {
				productVariant {
					id
					inventoryManagement
					inventoryPolicy
				}
				userErrors {
					field
					message
				}
			}
		}
	`;

	const url = `${SHOPIFY_STORE_URL}/admin/api/2024-01/graphql.json`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'X-Shopify-Access-Token': accessToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query: mutation,
			variables: {
				input: {
					id: `gid://shopify/ProductVariant/${variantId}`,
					inventoryManagement: 'SHOPIFY',
					inventoryPolicy: 'DENY'
				}
			}
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to enable inventory tracking: ${response.status} ${errorText.substring(0, 200)}`);
	}

	const data = await response.json();
	if (data.errors) {
		throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
	}

	if (data.data?.productVariantUpdate?.userErrors?.length > 0) {
		throw new Error(`User errors: ${JSON.stringify(data.data.productVariantUpdate.userErrors)}`);
	}
}

/**
 * Update Shopify inventory
 */
async function updateInventory(sku: string, quantity: number, accessToken: string): Promise<boolean> {
	try {
		const variantInfo = await findVariantBySku(sku, accessToken);
		if (!variantInfo) {
			throw new Error('Variant not found');
		}

		const locationId = await getLocationId(accessToken);
		if (!locationId) {
			throw new Error('Location ID not found');
		}

		// First, try to update inventory
		const url = `${SHOPIFY_STORE_URL}/admin/api/2024-01/inventory_levels/set.json`;
		let response = await fetch(url, {
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

		// If inventory tracking is not enabled, try to enable it automatically
		// Note: This requires write_products scope. Alternatively, enable tracking manually in Shopify admin.
		if (!response.ok) {
			const errorText = await response.text();
			try {
				const errorJson = JSON.parse(errorText);
				if (errorJson.errors?.some((e: string) => e.includes('inventory tracking enabled'))) {
					try {
						// Try to enable inventory tracking automatically
						await enableInventoryTracking(variantInfo.variantId, accessToken);
						
						// Retry the inventory update
						response = await fetch(url, {
							method: 'POST',
							headers: {
								'X-Shopify-Access-Token': accessToken,
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								inventory_item_id: variantInfo.inventoryItemId,
								location_id: locationId,
								available: Math.max(0, Math.round(quantity))
							})
						});
					} catch (enableError) {
						// If enabling tracking fails (e.g., missing write_products scope),
						// provide a helpful error message
						throw new Error(
							`Inventory tracking not enabled for this variant. ` +
							`Either: 1) Enable it manually in Shopify admin (Products > [Product] > Variants > Track quantity), ` +
							`or 2) Add write_products scope to your app to enable it automatically. ` +
							`Original error: ${errorJson.errors.join(', ')}`
						);
					}
				}
			} catch {
				// If we can't parse the error, just throw it
			}
		}

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `HTTP ${response.status} ${response.statusText}`;
			try {
				const errorJson = JSON.parse(errorText);
				errorMessage += `: ${JSON.stringify(errorJson)}`;
			} catch {
				errorMessage += `: ${errorText.substring(0, 200)}`;
			}
			throw new Error(errorMessage);
		}

		return true;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error(String(error));
	}
}

/**
 * Sync all quantities to Shopify
 */
async function syncAllQuantities() {
	console.log('🔄 Starting Shopify inventory sync...\n');

	const db = createPool({ connectionString: POSTGRES_URL }) as VercelPool;

	try {
		// Get access token
		console.log('🔐 Authenticating with Shopify...');
		const accessToken = await getAccessToken();
		if (!accessToken) {
			console.error('❌ Failed to get Shopify access token');
			process.exit(1);
		}
		console.log('✅ Authenticated\n');

		// Get all styleColours with SKUs
		console.log('📦 Fetching all style/colour combinations with SKUs...');
		const result = await db.sql`
			SELECT sc.id, sc.sku, s.name AS style, c.name AS colour
			FROM stylescolours sc
			JOIN styles s ON sc."styleId" = s.id
			JOIN colours c ON sc."colourId" = c.id
			WHERE sc.sku IS NOT NULL AND sc.sku != ''
			ORDER BY s.name, c.name
		`;

		const styleColours = result.rows;
		const total = styleColours.length;

		if (total === 0) {
			console.log('⚠️  No style/colour combinations with SKUs found');
			return;
		}

		console.log(`✅ Found ${total} style/colour combinations with SKUs\n`);

		// Track results
		let successCount = 0;
		let errorCount = 0;
		const errors: Array<{ sku: string; style: string; colour: string; error: string }> = [];

		// Sync each one
		for (let i = 0; i < styleColours.length; i++) {
			const item = styleColours[i];
			const { id, sku, style, colour } = item;
			const progress = `[${i + 1}/${total}]`;

			try {
				const quantity = await calculateQuantity(db, id);
				await updateInventory(sku, quantity, accessToken);
				console.log(`✅ ${progress} ${style} - ${colour} (${sku}): ${quantity.toFixed(2)} yards`);
				successCount++;
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error);
				console.error(`❌ ${progress} ${style} - ${colour} (${sku}): ${errorMsg}`);
				errors.push({ sku, style, colour, error: errorMsg });
				errorCount++;
			}

			// Small delay to avoid rate limiting
			if (i < styleColours.length - 1) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('📊 Sync Summary:');
		console.log(`   ✅ Successful: ${successCount}`);
		console.log(`   ❌ Errors: ${errorCount}`);
		console.log(`   📦 Total: ${total}`);

		if (errors.length > 0) {
			console.log('\n❌ Errors:');
			errors.forEach(({ sku, style, colour, error }) => {
				console.log(`   - ${style} - ${colour} (${sku}): ${error}`);
			});
		}

		console.log('\n✨ Sync complete!');
	} catch (error) {
		console.error('❌ Fatal error:', error);
		process.exit(1);
	} finally {
		await db.end();
	}
}

// Run the sync
syncAllQuantities().catch((error) => {
	console.error('❌ Unhandled error:', error);
	process.exit(1);
});
