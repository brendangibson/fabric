import type { TStyleColour, StockQuery, StockResponse } from './types.js';
export declare class FabricDatabase {
    private db;
    constructor(connectionString: string);
    getCurrentStock(query?: StockQuery): Promise<StockResponse>;
    getStockHistory(sku: string, days?: number): Promise<any[]>;
    getLowStockItems(threshold?: number): Promise<TStyleColour[]>;
    getStockByCategory(): Promise<any[]>;
    close(): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map