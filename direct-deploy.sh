#!/bin/bash

# Exit on error
set -e

# Print commands
set -x

# Create a temporary directory for the minimal app
mkdir -p temp-deploy

# Create a minimal package.json
cat > temp-deploy/package.json << 'EOL'
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
    "react-dom": "18.2.0"
  }
}
EOL

# Create a minimal next.config.js
cat > temp-deploy/next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
EOL

# Create a minimal pages directory with index.js
mkdir -p temp-deploy/pages
cat > temp-deploy/pages/index.js << 'EOL'
import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Party Function Hall Management System</h1>
      <p>This is a placeholder page for the deployment test.</p>
      <p>The full application will be deployed soon.</p>
    </div>
  );
}
EOL

# Install dependencies in the temporary directory
cd temp-deploy
npm install

# Build the application
npm run build

# Copy the build output back to the main directory
cp -r .next ../.next

# Go back to the main directory
cd ..

# Clean up
rm -rf temp-deploy

echo "Direct deployment preparation complete. The .next directory is ready for Vercel."
