# Local OAuth Testing Guide

## Environment Setup

Create a `.env` file in your project root with these values:

```bash
# OAuth Configuration for Local Testing
OAUTH_ISSUER_URL=https://your-tenant.auth0.com
OAUTH_AUDIENCE=https://www.sienandco.space
OAUTH_CLIENT_ID=your_auth0_client_id_here
OAUTH_CLIENT_SECRET=your_auth0_client_secret_here
OAUTH_REQUIRED_SCOPE=read:inventory write:inventory

# Database (keep your existing config)
POSTGRES_URL=your_postgres_connection_string
```

## Get Test Token from Auth0

### Option 1: Auth0 Dashboard Test

1. Go to your Auth0 Application
2. Click "Test" tab
3. Click "Get Token"
4. Copy the access token

### Option 2: Auth0 Management API

```bash
curl -X POST https://your-tenant.auth0.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "audience": "https://www.sienandco.space",
    "grant_type": "client_credentials",
    "scope": "read:inventory write:inventory"
  }'
```

## Test Local OAuth

### Start Development Server

```bash
npm run dev
```

### Test Authentication

```bash
# Test without token (should fail)
curl "http://localhost:5173/api/mcp/tools"

# Test with valid OAuth token (should work)
curl "http://localhost:5173/api/mcp/tools" \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN"

# Test MCP protocol with OAuth
curl "http://localhost:5173/api/mcp/tools" \
  -H "Accept: application/mcp" \
  -H "x-mcp-protocol: true" \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN"
```

## Expected Results

✅ **Without Token**: 401 Unauthorized  
✅ **With Valid Token**: 200 OK with tools list  
✅ **MCP Protocol**: JSON-RPC 2.0 response format
