import { minRollSize } from '../constants';
import type { VercelPool } from '@vercel/postgres';

/**
 * Calculate the current available quantity (in yards) for a given styleColourId.
 * Shared by the main app and sync script to ensure consistent logic.
 *
 * Formula: remaining (rolls - cuts) + standby - holds
 * - Remaining: sum of non-returned roll lengths minus cuts, excluding rolls with ≤ 0.5 yards left
 * - Standby: fabric on standby
 * - Holds: reserved holds that haven't expired
 *
 * Result is rounded down to the nearest 5 yards. If < 5 yards, returns 0.
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
			) + COALESCE(
				(SELECT SUM(length) FROM standby WHERE "styleColourId" = ${styleColourId}),
				0
			)
			- COALESCE(
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
