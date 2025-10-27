# Deploying to Vercel

This guide will walk you through the process of deploying the Party Function Hall Management System to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)
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

If you encounter any issues during deployment, check the following:

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
