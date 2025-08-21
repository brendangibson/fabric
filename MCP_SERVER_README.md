# Fabric Inventory MCP Server

This project now includes a Model Context Protocol (MCP) server that allows AI assistants and other MCP clients to query your fabric inventory system.

## What is MCP?

The Model Context Protocol (MCP) is a standard that allows AI assistants to securely connect to external data sources and tools. With this MCP server, users can:

- Query current stock levels using natural language
- Get stock history and usage patterns
- Find low stock items that need reordering
- Analyze inventory by category
- Search across all fabric styles and colors

## Quick Start

1. **Navigate to the MCP server directory:**

   ```bash
   cd mcp-server
   ```

2. **Run the installation script:**

   ```bash
   ./install.sh
   ```

3. **Configure your database connection:**

   ```bash
   # Edit .env file with your POSTGRES_URL
   nano .env
   ```

4. **Test the server:**

   ```bash
   npm run cli
   ```

5. **Start the MCP server:**
   ```bash
   npm start
   ```

## Available Tools

The MCP server provides these tools:

### `get_current_stock`

- Filter by style, color, SKU
- Set minimum/maximum stock thresholds
- Include/exclude holds, incoming orders, standby items

### `get_stock_history`

- Track usage patterns for specific SKUs
- Configurable time periods (default: 30 days)

### `get_low_stock_items`

- Find items below specified stock thresholds
- Useful for reorder alerts

### `get_stock_by_category`

- Group inventory by fabric style
- Summary totals for each category

### `search_inventory`

- Natural language queries
- Example: "show me all linen fabrics with low stock"

## MCP Client Integration

To use this with an MCP client (like Claude Desktop, Ollama, etc.), add this configuration:

```json
{
	"mcpServers": {
		"fabric-inventory": {
			"command": "node",
			"args": ["/path/to/fabric/mcp-server/dist/index.js"],
			"env": {
				"POSTGRES_URL": "your-postgresql-connection-string"
			}
		}
	}
}
```

## Example Queries

Once connected, users can ask questions like:

- "What's the current stock of linen fabrics?"
- "Show me items with less than 5 yards remaining"
- "What's the usage history for SKU POCSTOFAB?"
- "Which fabrics are running low on stock?"
- "Give me a summary of all cotton fabrics"

## Security

- The MCP server only provides read access to inventory data
- No modification operations are exposed
- Database connection uses your existing PostgreSQL credentials
- All queries are logged for audit purposes

## Architecture

The MCP server is built with:

- **TypeScript** for type safety
- **@modelcontextprotocol/sdk** for MCP compliance
- **@vercel/postgres** for database connectivity
- **Modular design** for easy extension

## Development

- **Source**: `mcp-server/src/`
- **Build**: `npm run build`
- **Test**: `npm run cli` (requires database connection)
- **Add tools**: Extend `server.ts` and `database.ts`

## Benefits

1. **Natural Language Access**: Users can query inventory in plain English
2. **Real-time Data**: Always up-to-date stock information
3. **Comprehensive Coverage**: Includes holds, incoming, and standby items
4. **Easy Integration**: Works with any MCP-compatible client
5. **Extensible**: Easy to add new query capabilities

## Support

For issues or questions about the MCP server:

1. Check the `mcp-server/README.md` for detailed documentation
2. Review the logs for error information
3. Test with the CLI tool: `npm run cli`
4. Verify database connectivity and permissions

The MCP server enhances your fabric inventory system by making it accessible to AI assistants, enabling natural language queries and real-time stock information access.
