#!/bin/bash
set -e

echo "Running simple build script for Netlify"

# Clean up
rm -rf node_modules
rm -f package-lock.json

# Use simplified package.json
cp netlify-package.json package.json

# Install dependencies
pnpm install

# Build the application
pnpm run build

echo "Simple build completed"
