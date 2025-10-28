#!/bin/bash

# Exit on error
set -e

# Print commands
set -x

# Ensure we're in the right directory
echo "Current directory: $(pwd)"
echo "Listing directory contents:"
ls -la

# Verify package.json exists and contains next.js
if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found!"
  exit 1
fi

echo "Contents of package.json:"
cat package.json

# Create a minimal package.json that definitely has Next.js
cat > package.json.new << 'EOL'
{
  "name": "party-hall-booking",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed-users": "node scripts/seed-users.js",
    "seed-halls": "node scripts/seed-halls.js",
    "seed-customers": "node scripts/seed-customers.js",
    "seed-bookings": "node scripts/seed-bookings.js",
    "seed-expenses": "node scripts/seed-expenses.js",
    "seed-payments": "node scripts/seed-payments.js",
    "seed-all": "node scripts/seed-all.js",
    "test-mongodb": "node scripts/test-mongodb-connection.js",
    "generate-secret": "node scripts/generate-secret.js"
  },
  "dependencies": {
    "next": "13.4.19",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "mongoose": "7.5.0",
    "next-auth": "4.22.1",
    "bcryptjs": "2.4.3",
    "dotenv": "16.3.1",
    "zod": "3.21.4",
    "react-hook-form": "7.45.4",
    "@hookform/resolvers": "3.3.0"
  },
  "devDependencies": {
    "autoprefixer": "10.4.14",
    "postcss": "8.4.27",
    "tailwindcss": "3.3.3",
    "eslint": "8.46.0",
    "eslint-config-next": "13.4.19"
  }
}
EOL

# Replace the package.json with our new one
mv package.json.new package.json

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

# Install dependencies with all flags to bypass issues
npm install --legacy-peer-deps --no-fund --no-audit --force

# List installed packages to verify next.js is there
npm list next

# Build the application
npm run build
