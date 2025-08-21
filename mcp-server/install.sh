#!/bin/bash

echo "Installing Fabric Inventory MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "Node.js version: $(node -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo "Please edit .env file with your database connection details"
else
    echo ".env file already exists"
fi

echo ""
echo "Installation completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your POSTGRES_URL"
echo "2. Test the server: npm run cli"
echo "3. Start the MCP server: npm start"
echo ""
echo "For MCP client configuration, see mcp-config.json"
