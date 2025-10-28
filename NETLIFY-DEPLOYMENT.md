# Deploying to Netlify

This guide provides step-by-step instructions for deploying the Party Function Hall Management System to Netlify.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. MongoDB Atlas database set up (see DEPLOYMENT.md for details)

## Step 1: Prepare Your Repository

The repository has already been configured with the necessary files for Netlify deployment:

- `netlify.toml`: Configuration file for Netlify build settings
- `netlify-build.sh`: Custom build script to handle dependencies
- `next.config.js`: Updated with Netlify-specific settings

## Step 2: Deploy to Netlify

### Option 1: Deploy via Netlify UI

1. Log in to your [Netlify account](https://app.netlify.com/)
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

### Option 2: Deploy via Netlify CLI

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to your Netlify account:
   ```bash
   netlify login
   ```

3. Initialize your site:
   ```bash
   netlify init
   ```

4. Follow the prompts to create a new site or link to an existing one
5. Set up your environment variables:
   ```bash
   netlify env:set MONGODB_URI "your-mongodb-uri"
   netlify env:set NEXTAUTH_URL "https://your-site-name.netlify.app"
   netlify env:set NEXTAUTH_SECRET "your-secure-secret"
   ```

6. Deploy your site:
   ```bash
   netlify deploy --prod
   ```

## Step 3: Verify Deployment

1. Once deployment is complete, Netlify will provide you with a URL for your site
2. Visit the URL to ensure your application is working correctly
3. Test key functionality:
   - User authentication
   - Hall booking
   - Payment processing
   - Admin dashboard

## Step 4: Set Up Custom Domain (Optional)

1. In the Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow the instructions to configure your domain with Netlify

## Troubleshooting

### Build Failures

If your build fails, check the build logs in the Netlify dashboard for specific errors:

1. **MongoDB Connection Issues**:
   - Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` to allow connections from Netlify
   - Verify your MONGODB_URI environment variable is correctly set

2. **NextAuth Configuration**:
   - Make sure NEXTAUTH_URL is set to your Netlify site URL
   - Ensure NEXTAUTH_SECRET is properly set

3. **Dependency Issues**:
   - If you encounter dependency conflicts, try updating the `netlify-build.sh` script
   - You may need to add specific versions of problematic packages

### Runtime Errors

If your application deploys but doesn't function correctly:

1. **API Routes Not Working**:
   - Check Netlify Functions logs in the dashboard
   - Ensure your API routes are compatible with serverless deployment

2. **Authentication Issues**:
   - Verify that NEXTAUTH_URL matches your actual site URL
   - Check browser console for CORS errors

## Continuous Deployment

Netlify automatically sets up continuous deployment from your Git repository. Any changes pushed to your main branch will trigger a new deployment.

To disable automatic deployments:
1. Go to "Site settings" > "Build & deploy" > "Continuous deployment"
2. Toggle "Stop builds" to pause automatic deployments

## Resources

- [Netlify Docs for Next.js](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Next.js on Netlify](https://github.com/netlify/next-on-netlify)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
