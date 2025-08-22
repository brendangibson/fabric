# MCP Client Configuration for Fabric Inventory

Your SvelteKit app now serves **both** HTTP API and MCP protocol through the same endpoints!

## **Authentication**

The MCP endpoints are protected by API keys. You can have multiple keys for different clients.

### **Environment Setup**

```bash
# In your .env file
MCP_API_KEYS=abc123def456:claude,xyz789uvw012:bard,admin-super-secret:admin
```

### **Key Formats**

- **Simple**: `key1,key2,key3` (just the keys)
- **Named**: `key1:client1,key2:client2` (key with client name)

## **Available Endpoints**

- **`GET /api/mcp/tools`** - List available tools
- **`POST /api/mcp/stock`** - Query current stock
- **`POST /api/mcp/search`** - Search inventory
- **`GET /api/mcp/health`** - Health check

## **How AI Clients Use This**

### **Option 1: HTTP API (Simple)**

```bash
# Get available tools
curl "http://localhost:5173/api/mcp/tools"

# Query stock
curl -X POST "http://localhost:5173/api/mcp/stock" \
  -H "Content-Type: application/json" \
  -d '{"style": "Cortina", "colour": "Mist"}'
```

### **Option 2: MCP Protocol (Advanced)**

```bash
# Get tools with MCP headers and API key
curl "http://localhost:5173/api/mcp/tools" \
  -H "Accept: application/mcp" \
  -H "x-mcp-protocol: true" \
  -H "x-mcp-id: request-123" \
  -H "x-mcp-api-key: abc123def456"
```

## **MCP Protocol Support**

Your endpoints automatically detect MCP requests and return responses in the appropriate format:

- **HTTP requests** → Standard JSON responses
- **MCP requests** → MCP protocol responses with `jsonrpc: "2.0"`

## **Benefits of This Approach**

✅ **Single server** - Everything runs in SvelteKit
✅ **Dual protocol support** - HTTP + MCP in one place
✅ **Shared database** - No duplicate connections
✅ **Unified authentication** - Same auth for both
✅ **Easier deployment** - One app to manage

## **Testing**

1. **Start your SvelteKit app**: `npm run dev`
2. **Test HTTP API**: Use the endpoints normally
3. **Test MCP protocol**: Add MCP headers to requests

Your fabric inventory system is now **simplified and powerful**! 🎉
