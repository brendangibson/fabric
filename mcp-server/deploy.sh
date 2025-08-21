#!/bin/bash

echo "🚀 Deploying Fabric Inventory MCP Server to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Make sure you're in the mcp-server directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables in Vercel dashboard:"
echo "   - POSTGRES_URL: Your database connection string"
echo "2. Test your API endpoints:"
echo "   - GET /api/tools"
echo "   - POST /api/stock"
echo "   - POST /api/search"
echo "3. Update your MCP client configuration to use the HTTP endpoints"
echo ""
echo "🔗 Your API will be available at: https://your-project.vercel.app"
