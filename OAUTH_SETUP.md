# OAuth Setup Guide for Fabric Inventory MCP Server

## Required Environment Variables

Add these to your `.env` file or Vercel environment variables:

```bash
# OAuth Provider Configuration
OAUTH_ISSUER_URL=https://your-domain.auth0.com
OAUTH_AUDIENCE=https://www.sienandco.space
OAUTH_CLIENT_ID=your_client_id_here
OAUTH_CLIENT_SECRET=your_client_secret_here

# Optional: Required scopes for MCP access
OAUTH_REQUIRED_SCOPE=read:inventory write:inventory
```

## Popular OAuth Providers

### 1. **Auth0**

- **Issuer URL**: `https://your-domain.auth0.com`
- **Audience**: Your API identifier
- **Scopes**: `read:inventory write:inventory`

### 2. **Clerk**

- **Issuer URL**: `https://clerk.your-domain.com`
- **Audience**: Your application domain
- **Scopes**: `read write`

### 3. **Firebase Auth**

- **Issuer URL**: `https://securetoken.google.com/your-project-id`
- **Audience**: Your project ID
- **Scopes**: Custom scopes you define

### 4. **Custom OAuth Server**

- **Issuer URL**: Your OAuth server URL
- **Audience**: Your application identifier
- **Scopes**: Scopes you define

## Setup Steps

### Step 1: Choose OAuth Provider

Select an OAuth provider that supports JWT tokens and JWKS.

### Step 2: Configure OAuth App

1. Create a new OAuth application
2. Set the redirect URI
3. Note down Client ID and Client Secret
4. Configure allowed scopes

### Step 3: Set Environment Variables

Add the environment variables to your deployment platform.

### Step 4: Test Authentication

Test with a valid OAuth token:

```bash
curl "https://www.sienandco.space/api/mcp/tools" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN"
```

## Security Features

✅ **JWT Verification** - Validates token signature using JWKS  
✅ **Expiration Checking** - Prevents use of expired tokens  
✅ **Audience Validation** - Ensures tokens are for your app  
✅ **Scope Checking** - Optional permission-based access control  
✅ **Clock Skew Protection** - Handles time synchronization issues

## Troubleshooting

### Common Issues:

1. **"Missing required OAuth environment variables"**

   - Check all environment variables are set
   - Verify variable names match exactly

2. **"Invalid JWT token"**

   - Token format is incorrect
   - Token is malformed

3. **"Token has expired"**

   - Token is past its expiration time
   - Get a fresh token from OAuth provider

4. **"Invalid audience"**

   - Token audience doesn't match OAUTH_AUDIENCE
   - Check OAuth app configuration

5. **"Insufficient scope"**
   - Token doesn't have required scopes
   - Request token with proper scopes

## Testing Locally

1. Set up environment variables in `.env`
2. Start development server: `npm run dev`
3. Test with valid OAuth token
4. Check server logs for validation details
