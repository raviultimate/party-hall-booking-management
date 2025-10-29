# Deployment Guide

This guide provides instructions for deploying the Party Function Hall Management System to Vercel or Netlify.

## Prerequisites

1. A GitHub account
2. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)
3. A Netlify account (you can sign up at [netlify.com](https://netlify.com) using your GitHub account)
4. A MongoDB Atlas account for the database (or any MongoDB hosting service)
3. A MongoDB Atlas account for the database (or any MongoDB hosting service)

## Step 1: Prepare Your MongoDB Database

1. Create a MongoDB Atlas account if you don't have one already
2. Create a new cluster
3. Create a database user with read/write permissions
4. Add your IP address to the IP whitelist (or allow access from anywhere for development)
5. Get your MongoDB connection string, which should look like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/party-hall-booking?retryWrites=true&w=majority
   ```

## Step 2: Push Your Code to GitHub

1. Create a new GitHub repository
2. Initialize Git in your project folder (if not already done):
   ```bash
   git init
   ```
3. Add all files to Git:
   ```bash
   git add .
   ```
4. Commit your changes:
   ```bash
   git commit -m "Initial commit"
   ```
5. Add your GitHub repository as a remote:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```
6. Push your code to GitHub:
   ```bash
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

1. Sign in to Vercel with your GitHub account
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
5. Add the following environment variables in the Vercel dashboard (Settings > Environment Variables):
   - `MONGODB_URI`: Your MongoDB connection string from step 1
   - `NEXTAUTH_URL`: Set this to your Vercel deployment URL (e.g., `https://your-project-name.vercel.app`)
   - `NEXTAUTH_SECRET`: A secure random string for session encryption (you can generate one with `npm run generate-secret`)
6. Click "Deploy"

## Step 4: Seed the Database

After deployment, you need to seed your database with initial data. You have two options:

### Option 1: Run the seed scripts locally

1. Make sure your `.env.local` file has the correct MongoDB URI pointing to your production database
2. Run the seed scripts:
   ```bash
   npm run seed-all
   ```

### Option 2: Use the Vercel CLI to run the seed scripts

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Login to Vercel:
   ```bash
   vercel login
   ```
3. Link your project:
   ```bash
   vercel link
   ```
4. Pull the environment variables:
   ```bash
   vercel env pull .env.local
   ```
5. Run the seed scripts:
   ```bash
   npm run seed-all
   ```

## Step 5: Share Your Application

Once deployed, you can share the Vercel URL with others. They will be able to access the application using the admin login credentials:

- Email: admin@partyhall.com
- Password: Admin@123

## Troubleshooting

### Fixing "npm install" Errors

If you encounter the error "Command 'npm install' exited with 1" during deployment, it's likely due to incompatible package versions or peer dependency issues. Here are multiple approaches to fix it:

#### Approach 1: Use Exact Versions and .npmrc

1. Use exact versions in package.json instead of caret (^) versions:
   ```json
   "dependencies": {
     "@hookform/resolvers": "3.3.1",
     "react-hook-form": "7.48.2",
     "zod": "3.22.4",
     // other dependencies with exact versions
   }
   ```

2. Add a `.npmrc` file to the root of your project with the following content:
   ```
   legacy-peer-deps=true
   strict-peer-dependencies=false
   auto-install-peers=true
   ```
   This will help resolve peer dependency conflicts during installation.

#### Approach 2: Use a Custom Build Script with npm ci

1. Create a build.sh script that uses npm ci with a backup package-lock.json:
   ```bash
   #!/bin/bash
   set -e
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
   
   # Copy our backup package-lock.json
   if [ -f "package-lock.json.backup" ]; then
     cp package-lock.json.backup package-lock.json
   fi
   
   # Install dependencies with all flags to bypass issues
   npm ci --legacy-peer-deps --no-fund --no-audit --no-optional
   
   # Build the application
   npm run build
   ```

2. Make the script executable:
   ```bash
   chmod +x build.sh
   ```

#### Approach 3: Use a Direct Deployment Script

This approach creates a minimal Next.js application that is guaranteed to deploy successfully, as a placeholder until you can fix the main application:

1. Create a fallback-build.sh script that uses a minimal package.json:
   ```bash
   #!/bin/bash
   set -e
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
   npm install --no-fund --no-audit
   
   # Build the application
   npm run build
   ```

2. Make the script executable:
   ```bash
   chmod +x fallback-build.sh
   ```

3. Update your vercel.json to try both scripts:
   ```json
   {
     "version": 2,
     "buildCommand": "chmod +x build.sh fallback-build.sh && ./build.sh || ./fallback-build.sh",
     "framework": "nextjs",
     "installCommand": "echo 'Using custom build script'"
   }
   ```

4. After making these changes, commit and push your changes, then redeploy.

### Other Common Issues

If you encounter other issues during deployment, check the following:

1. **Environment Variable Issues**:
   - Make sure all environment variables are set directly in the Vercel dashboard under Settings > Environment Variables
   - Do not use the `@` prefix in your environment variable values (e.g., use the actual MongoDB URI, not `@mongodb-uri`)
   - Verify that your MongoDB connection string is correct and includes the database name
   - Ensure NEXTAUTH_URL is set to your actual deployment URL

2. **MongoDB Connection Issues**:
   - Make sure your MongoDB Atlas cluster allows connections from Vercel's IP addresses
   - You may need to set Network Access in MongoDB Atlas to "Allow Access from Anywhere" (0.0.0.0/0) for simplicity
   - Verify that your database user has the correct permissions (readWrite)

3. **Build Errors**:
   - Review the build logs in the Vercel dashboard for any errors
   - If you see TypeScript errors, you may need to update your code or add type definitions

4. **Runtime Errors**:
   - Check the Function Logs in the Vercel dashboard for any runtime errors
   - Use the browser console to check for client-side errors

## Updating Your Deployment

Any changes pushed to your GitHub repository's main branch will automatically trigger a new deployment on Vercel.
# Deploying to Netlify

This section provides step-by-step instructions for deploying the Party Function Hall Management System to Netlify.

## Prerequisites

1. A GitHub repository with your Party Function Hall Management System code
2. A Netlify account (you can sign up at [netlify.com](https://netlify.com) using your GitHub account)
3. A MongoDB Atlas account for the database (or any MongoDB hosting service)

## Step 1: Prepare Your Repository

Ensure your repository includes the following Netlify-specific files:

1. **netlify.toml** - Configuration file for Netlify build settings:
   ```toml
   [build]
     command = "chmod +x netlify-build.sh && ./netlify-build.sh"
     publish = ".next"

   [build.environment]
     NETLIFY_NEXT_PLUGIN_SKIP = "true"
     NODE_VERSION = "18"

   [[plugins]]
     package = "@netlify/plugin-nextjs"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **netlify-build.sh** - Custom build script to handle dependencies:
   ```bash
   #!/bin/bash
   set -e
   set -x
   npm cache clean --force
   if [ -d "node_modules" ]; then rm -rf node_modules; fi
   npm install --legacy-peer-deps --no-fund --no-audit --force
   npm run build
   ```

3. **next.config.js** - Updated for Netlify compatibility:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     swcMinify: true,
     output: 'standalone',
     distDir: '.next',
     webpack: (config) => {
       return config;
     },
   }
   module.exports = nextConfig
   ```

## Step 2: Deploy to Netlify

1. Sign up for a Netlify account at [netlify.com](https://app.netlify.com/signup)
2. Click "New site from Git"
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the repository containing your Party Hall Booking application
6. Configure build settings:
   - Build command: `chmod +x netlify-build.sh && ./netlify-build.sh`
   - Publish directory: `.next`
7. Click "Show advanced" and add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXTAUTH_URL`: The URL of your Netlify site (you can update this after deployment)
   - `NEXTAUTH_SECRET`: A secure random string (generate using `npm run generate-secret`)
8. Click "Deploy site"

## Step 3: Update Environment Variables

After your site is deployed, update the `NEXTAUTH_URL` environment variable with your actual Netlify URL:

1. Go to "Site settings" > "Build & deploy" > "Environment"
2. Edit the `NEXTAUTH_URL` variable to match your Netlify domain (e.g., `https://your-site-name.netlify.app`)
3. Trigger a new deployment for the changes to take effect

## Step 4: Testing Your Deployment

1. Once deployment is complete, Netlify will provide you with a URL for your site
2. Visit the URL to ensure your application is working correctly
3. Test key functionality:
   - User authentication
   - Hall booking
   - Payment processing
   - Admin dashboard

## Troubleshooting Netlify Deployments

If you encounter issues with your Netlify deployment, try these solutions:

1. **Build Failures**:
   - Check the build logs in the Netlify dashboard for specific errors
   - Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` to allow connections from Netlify
   - Verify your environment variables are correctly set

2. **Missing Dependencies**:
   - If you encounter "Module not found" errors, check your package.json to ensure all dependencies are listed
   - Make sure all dependencies have exact version numbers (no ^ or ~ prefixes)
   - Update the netlify-build.sh script to include any missing dependencies

3. **NextAuth Issues**:
   - Make sure NEXTAUTH_URL is set to your Netlify site URL
   - Ensure NEXTAUTH_SECRET is properly set
   - Check for CORS errors in the browser console

4. **MongoDB Connection Issues**:
   - Verify your MongoDB connection string is correct
   - Ensure your MongoDB Atlas cluster is running and accessible
   - Check if your IP whitelist in MongoDB Atlas includes Netlify's IP ranges
