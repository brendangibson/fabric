# Fabric Inventory MCP Server

A Model Context Protocol (MCP) server that provides comprehensive access to fabric inventory data, allowing AI assistants to query stock levels, history, and inventory information.

## Features

- **Current Stock Queries**: Get real-time stock levels with filtering by style, colour, SKU, and stock thresholds
- **Stock History**: Track usage patterns and cuts over time for specific SKUs
- **Low Stock Alerts**: Identify items that need reordering
- **Category Analysis**: View stock summaries grouped by fabric style
- **Natural Language Search**: Query inventory using natural language
- **Comprehensive Data**: Includes holds, incoming orders, and standby items

## Installation

1. Clone or navigate to the `mcp-server` directory
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp env.example .env
   # Edit .env with your database connection details
   ```

4. Build the server:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

- `POSTGRES_URL`: Your PostgreSQL connection string (required)
- `LOG_LEVEL`: Logging level (optional, defaults to info)

### Database Requirements

The server expects a PostgreSQL database with the following tables:

- `stylescolours`: Main inventory items with SKUs
- `styles`: Fabric styles (linen, cotton, wool, etc.)
- `colours`: Fabric colours
- `rolls`: Individual fabric rolls
- `cuts`: Cuts made from rolls
- `holds`: Reserved fabric holds
- `incoming`: Expected incoming orders
- `standby`: Standby inventory items

## Usage

### Starting the Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### MCP Client Configuration

Add this to your MCP client configuration:

```json
{
	"mcpServers": {
		"fabric-inventory": {
			"command": "node",
			"args": ["/path/to/mcp-server/dist/index.js"],
			"env": {
				"POSTGRES_URL": "your-database-url"
			}
		}
	}
}
```

## Available Tools

### 1. get_current_stock

Get current stock levels with optional filtering.

**Parameters:**

- `style` (string): Filter by style name (partial match)
- `colour` (string): Filter by colour name (partial match)
- `sku` (string): Filter by SKU (partial match)
- `minStock` (number): Minimum stock level filter
- `maxStock` (number): Maximum stock level filter
- `includeHolds` (boolean): Include hold information
- `includeIncoming` (boolean): Include incoming orders
- `includeStandby` (boolean): Include standby items

**Example:**

```json
{
	"style": "linen",
	"minStock": 5,
	"includeHolds": true
}
```

### 2. get_stock_history

Get stock usage history for a specific SKU.

**Parameters:**

- `sku` (string, required): SKU to get history for
- `days` (number): Number of days to look back (default: 30)

**Example:**

```json
{
	"sku": "POCSTOFAB",
	"days": 60
}
```

### 3. get_low_stock_items

Get items with stock below a specified threshold.

**Parameters:**

- `threshold` (number): Stock threshold (default: 10)

**Example:**

```json
{
	"threshold": 5
}
```

### 4. get_stock_by_category

Get stock summary grouped by style/category.

**Parameters:** None

### 5. search_inventory

Search inventory using natural language queries.

**Parameters:**

- `query` (string, required): Natural language search query

**Example:**

```json
{
	"query": "show me all linen fabrics with low stock"
}
```

## Example Queries

### Get all linen fabrics

```json
{
	"style": "linen"
}
```

### Find items with less than 5 yards

```json
{
	"maxStock": 5
}
```

### Search for specific SKU

```json
{
	"sku": "POCSTOFAB"
}
```

### Get low stock alerts

```json
{
	"threshold": 10
}
```

## Response Format

All tools return structured responses with:

- **Current Stock**: Real-time stock levels
- **Holds**: Reserved fabric quantities
- **Incoming**: Expected deliveries
- **Standby**: Available standby inventory
- **Summary**: Aggregated totals and counts

## Development

### Project Structure

```
mcp-server/
├── src/
│   ├── types.ts          # Type definitions
│   ├── database.ts       # Database operations
│   ├── server.ts         # MCP server implementation
│   └── index.ts          # Entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Adding New Tools

1. Add the tool definition to the `tools` array in `server.ts`
2. Implement the handler in the `handleCallTool` function
3. Add any necessary database methods in `database.ts`
4. Update types if needed

### Testing

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**: Check your `POSTGRES_URL` environment variable
2. **Permission Denied**: Ensure the database user has read access to the required tables
3. **Build Errors**: Make sure TypeScript is properly installed and configured

### Logs

The server logs to stderr. Check your MCP client's logs for detailed error information.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please check the main fabric app repository or create an issue there.
