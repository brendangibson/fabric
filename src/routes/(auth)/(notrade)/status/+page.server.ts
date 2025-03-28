import { minRollSize } from '../../../../constants';
import { handleLoadError } from '../../../../db/load';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { db } = locals;
	try {
		const mainPromise = db.sql`SELECT sc.id, sc."swatchUrl", s.name AS style, c.name AS colour,
            (SELECT SUM(c.length)/ (extract( day from NOW() - greatest(min(c.timestamp),NOW() - INTERVAL '30000 DAY')) +1)
                FROM rolls r, cuts c 
                WHERE c."rollId" = r.id AND c.timestamp >  NOW() - INTERVAL '30000 DAY' AND r."styleColourId" = sc.id) AS rate,
            (SELECT COALESCE(
                            (
                                SELECT SUM(CASE WHEN i.length > ${minRollSize} THEN i.length ELSE 0 END)
                                FROM (SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, r."styleColourId" AS csi, r."originalLength" FROM rolls r
                                LEFT JOIN cuts c ON r.id = c."rollId"
                                WHERE NOT r.returned GROUP BY r.id
                            ) AS i
                            WHERE i.csi = sc.id
                            GROUP BY i.csi
                        ),0))
                        AS remaining,
            (SELECT COALESCE(SUM(length),0)
                        FROM holds WHERE "styleColourId" = sc.id AND expires > NOW()) AS "holdsLength",
            (SELECT COALESCE(SUM(length),0) FROM incoming WHERE "styleColourId" = sc.id) AS "incomingLength",
            (SELECT COALESCE(SUM(length),0) FROM standby WHERE "styleColourId" = sc.id) AS "standbyLength" 
        FROM stylescolours sc, styles s, colours c 
        WHERE sc."colourId" = c.id AND sc."styleId" = s.id 
        ORDER BY style, colour`;

		const payload = { stylesColours: (await mainPromise)?.rows };

		return payload;
	} catch (e) {
		handleLoadError('error getting status', e);
	}
};
