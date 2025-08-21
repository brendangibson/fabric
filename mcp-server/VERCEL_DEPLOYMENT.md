# 🚀 Deploying Fabric Inventory MCP Server to Vercel

This guide will walk you through deploying your MCP server to Vercel as a serverless API.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repo
4. **Database**: Your PostgreSQL database should be accessible from Vercel

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file for local testing:

```bash
POSTGRES_URL="your-postgresql-connection-string"
```

### 3. Test Locally (Optional)

```bash
# Build the project
npm run build

# Test the API endpoints locally
curl http://localhost:3000/api/tools
```

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set project name (e.g., fabric-mcp-server)
# - Set root directory (./mcp-server)
# - Override settings? No
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Set root directory to `./mcp-server`
5. Deploy

### 5. Configure Environment Variables on Vercel

1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add `POSTGRES_URL` with your database connection string
4. Redeploy if needed

## 🌐 API Endpoints

Once deployed, your server will be available at:

- **Base URL**: `https://your-project.vercel.app`
- **Tools List**: `GET /api/tools`
- **Current Stock**: `POST /api/stock`
- **Search Inventory**: `POST /api/search`

## 📡 Testing the Deployed API

### List Available Tools

```bash
curl https://your-project.vercel.app/api/tools
```

### Get Current Stock

```bash
curl -X POST https://your-project.vercel.app/api/stock \
  -H "Content-Type: application/json" \
  -d '{
    "style": "linen",
    "minStock": 10
  }'
```

### Search Inventory

```bash
curl -X POST https://your-project.vercel.app/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "show me all linen fabrics with low stock"
  }'
```

## 🔒 Security Considerations

1. **CORS**: Currently set to allow all origins (`*`). Restrict this in production
2. **Rate Limiting**: Consider adding rate limiting for production use
3. **Authentication**: Add authentication if needed for sensitive data
4. **Database**: Ensure your database connection string is secure

## 🛠️ Customization

### Adding New Endpoints

1. Create a new file in the `api/` directory (e.g., `api/history.ts`)
2. Export a default function that handles HTTP requests
3. Update `vercel.json` if needed

### Modifying Response Format

Edit the response functions in each API file to match your needs.

## 📊 Monitoring

- **Vercel Dashboard**: Monitor function execution and errors
- **Logs**: View function logs in the Vercel dashboard
- **Metrics**: Track API usage and performance

## 🔄 Updating

To update your deployed server:

```bash
# Make your changes
git add .
git commit -m "Update MCP server"
git push

# Vercel will automatically redeploy
# Or manually trigger:
vercel --prod
```

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure `POSTGRES_URL` is set correctly
2. **Database Connection**: Verify your database is accessible from Vercel
3. **Build Errors**: Check the build logs in Vercel dashboard
4. **Function Timeout**: Increase `maxDuration` in `vercel.json` if needed

### Debug Mode

Enable debug logging by adding to your environment variables:

```bash
DEBUG=*
```

## 🌟 Benefits of Vercel Deployment

1. **Serverless**: No server management required
2. **Global CDN**: Fast response times worldwide
3. **Auto-scaling**: Handles traffic spikes automatically
4. **Easy Updates**: Automatic deployments from Git
5. **Monitoring**: Built-in analytics and logging

## 🔗 Integration with MCP Clients

Once deployed, you can use the HTTP endpoints instead of the stdio-based MCP server:

```json
{
	"mcpServers": {
		"fabric-inventory-http": {
			"type": "http",
			"baseUrl": "https://your-project.vercel.app/api",
			"endpoints": {
				"tools": "/tools",
				"stock": "/stock",
				"search": "/search"
			}
		}
	}
}
```

## 📝 Next Steps

1. Deploy to Vercel
2. Test the API endpoints
3. Configure your MCP client to use the HTTP endpoints
4. Monitor usage and performance
5. Add authentication and rate limiting as needed

Your MCP server is now ready for production use on Vercel! 🎉
