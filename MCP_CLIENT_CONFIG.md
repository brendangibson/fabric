# MCP Client Configuration for Fabric Inventory

This document explains how to configure AI clients to use the Fabric Inventory MCP server, which supports both HTTP and MCP protocols.

## Server Information

- **Base URL**: `https://www.sienandco.space/api/mcp`
- **Protocol**: HTTP + MCP (Model Context Protocol)
- **Authentication**: OAuth Bearer Token

## Authentication

The server now uses **OAuth Bearer Token** authentication instead of API keys.

### OAuth Setup

1. **Obtain an OAuth token** from your OAuth provider
2. **Include the token** in the `Authorization` header:
   ```
   Authorization: Bearer YOUR_OAUTH_TOKEN
   ```

### Environment Variables

Set these environment variables for OAuth configuration:

```bash
# OAuth Provider Configuration
OAUTH_ISSUER_URL=https://your-oauth-provider.com
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_AUDIENCE=your_audience
```

## Available Endpoints

### 1. Tools List (`/tools`)

**HTTP Request:**

```bash
curl "https://www.sienandco.space/api/mcp/tools"
```

**MCP Request:**

```bash
curl "https://www.sienandco.space/api/mcp/tools" \
  -H "Accept: application/mcp" \
  -H "x-mcp-protocol: true" \
  -H "x-mcp-id: test-123" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN"
```

### 2. Stock Information (`/stock`)

**HTTP Request:**

```bash
curl -X POST "https://www.sienandco.space/api/mcp/stock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -d '{
    "style": "Cortina",
    "colour": "Mist"
  }'
```

**MCP Request:**

```bash
curl -X POST "https://www.sienandco.space/api/mcp/stock" \
  -H "Accept: application/mcp" \
  -H "x-mcp-protocol: true" \
  -H "x-mcp-id: test-123" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "style": "Cortina",
    "colour": "Mist"
  }'
```

### 3. Natural Language Search (`/search`)

**HTTP Request:**

```bash
curl -X POST "https://www.sienandco.space/api/mcp/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -d '{
    "query": "Which fabric has the most inventory?"
  }'
```

**MCP Request:**

```bash
curl -X POST "https://www.sienandco.space/api/mcp/search" \
  -H "Accept: application/mcp" \
  -H "x-mcp-protocol: true" \
  -H "x-mcp-id: test-123" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Which fabric has the most inventory?"
  }'
```

### 4. Health Check (`/health`)

```bash
curl "https://www.sienandco.space/api/mcp/health"
```

## Available Tools

The MCP server provides these tools:

1. **`get_current_stock`** - Get current stock levels with optional filtering
2. **`get_stock_history`** - Get stock history for a specific SKU
3. **`get_low_stock_items`** - Get items below stock threshold
4. **`get_stock_by_category`** - Group stock by style or colour
5. **`search_inventory`** - Natural language inventory search

## MCP Protocol Support

The server automatically detects MCP requests via:

- `Accept: application/mcp` header, or
- `x-mcp-protocol: true` header

MCP requests return JSON-RPC 2.0 formatted responses, while HTTP requests return standard JSON responses.

## OAuth Implementation Notes

- **Token Validation**: Tokens are validated against your OAuth provider
- **Scope Checking**: Ensure tokens have appropriate permissions for inventory access
- **Token Refresh**: Implement token refresh logic in your client
- **Security**: Always use HTTPS and validate token expiration

## Testing

Test your OAuth setup with:

```bash
# Test authentication
curl "https://www.sienandco.space/api/mcp/tools" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN"

# Test MCP protocol
curl "https://www.sienandco.space/api/mcp/tools" \
  -H "Accept: application/mcp" \
  -H "x-mcp-protocol: true" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN"
```

## Troubleshooting

- **401 Unauthorized**: Check your OAuth token and ensure it's valid
- **403 Forbidden**: Verify your token has the required scopes
- **500 Internal Error**: Check server logs for authentication issues
