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

# Install dependencies with all flags to bypass issues
npm install --legacy-peer-deps --no-fund --no-audit --force

# Build the application
npm run build
