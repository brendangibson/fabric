import { createPool } from '@vercel/postgres';
export class FabricDatabase {
    db;
    constructor(connectionString) {
        this.db = createPool({ connectionString });
    }
    async getCurrentStock(query = {}) {
        const { style, colour, sku, minStock, maxStock, includeHolds = true, includeIncoming = true, includeStandby = true } = query;
        try {
            // Build the base query
            let sqlQuery = `
        SELECT 
          sc.id, 
          sc."swatchUrl", 
          sc.sku,
          s.name AS style, 
          c.name AS colour,
          s.weight,
          s.thickness,
          sc."glenRavenName",
          (SELECT COALESCE(
            (
              SELECT SUM(CASE WHEN i.length > 0.5 THEN i.length ELSE 0 END)
              FROM (
                SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, 
                       r."styleColourId" AS csi, 
                       r."originalLength" 
                FROM rolls r
                LEFT JOIN cuts c ON r.id = c."rollId"
                WHERE NOT r.returned 
                GROUP BY r.id
              ) AS i
              WHERE i.csi = sc.id
              GROUP BY i.csi
            ),0)
          ) AS remaining
      `;
            if (includeHolds) {
                sqlQuery += `,
          (SELECT COALESCE(SUM(length),0)
           FROM holds 
           WHERE "styleColourId" = sc.id AND expires > NOW()) AS "holdsLength"`;
            }
            if (includeIncoming) {
                sqlQuery += `,
          (SELECT COALESCE(SUM(length),0) 
           FROM incoming 
           WHERE "styleColourId" = sc.id) AS "incomingLength"`;
            }
            if (includeStandby) {
                sqlQuery += `,
          (SELECT COALESCE(SUM(length),0) 
           FROM standby 
           WHERE "styleColourId" = sc.id) AS "standbyLength"`;
            }
            sqlQuery += `
        FROM stylescolours sc, styles s, colours c 
        WHERE sc."colourId" = c.id 
          AND sc."styleId" = s.id 
          AND sc.hidden = false
      `;
            // Add filters
            const filters = [];
            const params = [];
            let paramIndex = 1;
            if (style) {
                filters.push(`s.name ILIKE $${paramIndex}`);
                params.push(`%${style}%`);
                paramIndex++;
            }
            if (colour) {
                filters.push(`c.name ILIKE $${paramIndex}`);
                params.push(`%${colour}%`);
                paramIndex++;
            }
            if (sku) {
                filters.push(`sc.sku ILIKE $${paramIndex}`);
                params.push(`%${sku}%`);
                paramIndex++;
            }
            if (filters.length > 0) {
                sqlQuery += ` AND ${filters.join(' AND ')}`;
            }
            sqlQuery += ` ORDER BY style, colour`;
            const result = await this.db.query(sqlQuery, params);
            let rows = result.rows;
            // Apply stock level filters
            if (minStock !== undefined) {
                rows = rows.filter((row) => (row.remaining || 0) >= minStock);
            }
            if (maxStock !== undefined) {
                rows = rows.filter((row) => (row.remaining || 0) <= maxStock);
            }
            // Calculate summary
            const summary = {
                totalItems: rows.length,
                totalStock: rows.reduce((sum, row) => sum + (row.remaining || 0), 0),
                totalHolds: rows.reduce((sum, row) => sum + (row.holdsLength || 0), 0),
                totalIncoming: rows.reduce((sum, row) => sum + (row.incomingLength || 0), 0),
                totalStandby: rows.reduce((sum, row) => sum + (row.standbyLength || 0), 0)
            };
            return {
                timestamp: new Date().toISOString(),
                query,
                results: rows,
                summary
            };
        }
        catch (error) {
            throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getStockHistory(sku, days = 30) {
        try {
            const sqlQuery = `
        SELECT 
          DATE(c.timestamp) as date,
          SUM(c.length) as cut_length,
          COUNT(c.id) as cut_count
        FROM cuts c
        JOIN rolls r ON c."rollId" = r.id
        JOIN stylescolours sc ON r."styleColourId" = sc.id
        WHERE sc.sku = $1
          AND c.timestamp > NOW() - INTERVAL '${days} days'
        GROUP BY DATE(c.timestamp)
        ORDER BY date DESC
      `;
            const result = await this.db.query(sqlQuery, [sku]);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to get stock history: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getLowStockItems(threshold = 10) {
        try {
            const sqlQuery = `
        SELECT 
          sc.id, 
          sc."swatchUrl", 
          sc.sku,
          s.name AS style, 
          c.name AS colour,
          s.weight,
          s.thickness,
          sc."glenRavenName",
          (SELECT COALESCE(
            (
              SELECT SUM(CASE WHEN i.length > 0.5 THEN i.length ELSE 0 END)
              FROM (
                SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, 
                       r."styleColourId" AS csi, 
                       r."originalLength" 
                FROM rolls r
                LEFT JOIN cuts c ON r.id = c."rollId"
                WHERE NOT r.returned 
                GROUP BY r.id
              ) AS i
              WHERE i.csi = sc.id
              GROUP BY i.csi
            ),0)
          ) AS remaining
        FROM stylescolours sc, styles s, colours c 
        WHERE sc."colourId" = c.id 
          AND sc."styleId" = s.id 
          AND sc.hidden = false
        HAVING (SELECT COALESCE(
          (
            SELECT SUM(CASE WHEN i.length > 0.5 THEN i.length ELSE 0 END)
            FROM (
              SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, 
                     r."styleColourId" AS csi, 
                     r."originalLength" 
              FROM rolls r
              LEFT JOIN cuts c ON r.id = c."rollId"
              WHERE NOT r.returned 
              GROUP BY r.id
            ) AS i
            WHERE i.csi = sc.id
            GROUP BY i.csi
          ),0)
        ) <= $1
        ORDER BY remaining ASC
      `;
            const result = await this.db.query(sqlQuery, [threshold]);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to get low stock items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getStockByCategory() {
        try {
            const sqlQuery = `
        SELECT 
          s.name as style,
          COUNT(sc.id) as total_colours,
          SUM(
            (SELECT COALESCE(
              (
                SELECT SUM(CASE WHEN i.length > 0.5 THEN i.length ELSE 0 END)
                FROM (
                  SELECT r."originalLength" - COALESCE(SUM(c.length),0) AS length, 
                         r."styleColourId" AS csi, 
                         r."originalLength" 
                  FROM rolls r
                  LEFT JOIN cuts c ON r.id = c."rollId"
                  WHERE NOT r.returned 
                  GROUP BY r.id
                ) AS i
                WHERE i.csi = sc.id
                GROUP BY i.csi
              ),0)
            )
          ) as total_stock
        FROM stylescolours sc
        JOIN styles s ON sc."styleId" = s.id
        WHERE sc.hidden = false
        GROUP BY s.name
        ORDER BY total_stock DESC
      `;
            const result = await this.db.query(sqlQuery);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to get stock by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async close() {
        await this.db.end();
    }
}
//# sourceMappingURL=database.js.map