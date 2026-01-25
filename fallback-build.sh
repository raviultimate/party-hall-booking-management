#!/bin/bash

# Exit on error
set -e

# Print commands
set -x

# Clean npm cache
npm cache clean --force

# Remove node_modules if it exists
if [ -d "node_modules" ]; then
  rm -rf node_modules
fi

# Remove package-lock.json if it exists
if [ -f "package-lock.json" ]; then
  rm package-lock.json
fi

# Create a minimal package.json for deployment
cat > package.json << 'EOL'
{
  "name": "party-hall-booking",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "13.4.19",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "mongoose": "7.5.0",
    "next-auth": "4.22.1"
  }
}
EOL

# Install only essential dependencies
pnpm install

# Build the application
pnpm run build
