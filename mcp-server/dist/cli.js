#!/usr/bin/env node
import { FabricDatabase } from './database.js';
import dotenv from 'dotenv';
dotenv.config();
async function main() {
    const POSTGRES_URL = process.env.POSTGRES_URL;
    if (!POSTGRES_URL) {
        console.error('POSTGRES_URL environment variable is required');
        process.exit(1);
    }
    const db = new FabricDatabase(POSTGRES_URL);
    try {
        console.log('Testing Fabric Inventory MCP Server...\n');
        // Test 1: Get current stock
        console.log('1. Testing getCurrentStock...');
        const stock = await db.getCurrentStock({ style: 'linen' });
        console.log(`Found ${stock.summary.totalItems} linen items`);
        console.log(`Total stock: ${stock.summary.totalStock.toFixed(2)} yards\n`);
        // Test 2: Get low stock items
        console.log('2. Testing getLowStockItems...');
        const lowStock = await db.getLowStockItems(20);
        console.log(`Found ${lowStock.length} items with stock below 20 yards\n`);
        // Test 3: Get stock by category
        console.log('3. Testing getStockByCategory...');
        const categories = await db.getStockByCategory();
        console.log(`Found ${categories.length} categories\n`);
        console.log('All tests completed successfully!');
    }
    catch (error) {
        console.error('Error during testing:', error);
        process.exit(1);
    }
    finally {
        await db.close();
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
//# sourceMappingURL=cli.js.map