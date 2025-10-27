#!/bin/bash

# Initialize Git repository (if not already initialized)
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
else
  echo "Git repository already initialized."
fi

# Set up local Git configuration
echo "Setting up local Git configuration..."
read -p "Enter your GitHub username: " github_username
read -p "Enter your GitHub email: " github_email

git config --local user.name "$github_username"
git config --local user.email "$github_email"

echo "Local Git configuration set:"
echo "Username: $github_username"
echo "Email: $github_email"

# Create .gitignore file
echo "Creating .gitignore file..."
cat > .gitignore << EOL
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOL

echo ".gitignore file created."

# Add all files
echo "Adding files to Git..."
git add .

# Initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: Party Hall Booking System"

# Set up GitHub repository
echo "Now you need to create a GitHub repository:"
echo "1. Go to https://github.com/new"
echo "2. Enter a repository name (e.g., 'party-hall-booking-system')"
echo "3. Add a description (optional)"
echo "4. Choose public or private visibility"
echo "5. Click 'Create repository'"
echo ""
echo "After creating the repository, you'll need to choose an authentication method:"
echo ""
echo "OPTION 1: HTTPS (requires Personal Access Token)"
echo "----------------------------------------"
echo "If you want to use HTTPS, you'll need a Personal Access Token (PAT):"
echo "1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)"
echo "2. Generate a new token with 'repo' scope"
echo "3. Copy the token - you'll need it when pushing instead of your password"
echo ""
echo "OPTION 2: SSH (recommended if you have SSH keys set up)"
echo "----------------------------------------"
echo "If you want to use SSH, make sure you have SSH keys set up with GitHub:"
echo "1. Check if you have SSH keys: ls -la ~/.ssh"
echo "2. If not, create them: ssh-keygen -t ed25519 -C \"your_email@example.com\""
echo "3. Add to GitHub: Settings → SSH and GPG keys → New SSH key"
echo ""
read -p "Which URL format do you want to use? (https/ssh): " url_format
read -p "Enter your GitHub username: " github_username
read -p "Enter your repository name: " repo_name

if [ "$url_format" = "ssh" ]; then
  repo_url="git@github.com:$github_username/$repo_name.git"
else
  repo_url="https://github.com/$github_username/$repo_name.git"
fi

echo ""
echo "Run these commands to push your code to GitHub:"
echo "git remote add origin $repo_url"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "If using HTTPS, you'll be prompted for your username and Personal Access Token (not your regular password)."
echo "If using SSH, make sure your SSH keys are set up with GitHub."
echo ""
echo "Setup complete! Follow the instructions above to push your code to GitHub."
