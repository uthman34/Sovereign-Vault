# Vercel Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account** - Create a free account at https://www.mongodb.com/cloud/atlas
2. **GitHub Account** - Push your code to GitHub
3. **Vercel Account** - Sign up at https://vercel.com

## Step-by-Step Setup

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project (or use existing)
3. Create a new cluster:
   - Select free tier
   - Choose your preferred region
   - Click "Create Cluster"
4. Wait for cluster to be deployed (usually 1-2 minutes)
5. Create a database user:
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create a strong password and save it
6. Get connection string:
   - Go to "Clusters" and click "Connect"
   - Select "Drivers" tab
   - Copy the connection string
   - Replace `<username>` and `<password>` with your credentials
   - Example: `mongodb+srv://myuser:mypassword@cluster.mongodb.net/sovereign_archive`

### 2. Generate JWT Secret

Generate a strong random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this value - you'll need it for Vercel.

### 3. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial Sovereign Archive setup for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 4. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Click "Import"
5. In the configuration screen:
   - **Framework Preset**: Select "Vite"
   - **Build Command**: Leave as default (npm run build)
   - **Output Directory**: Leave as default (dist)
   - **Install Command**: Leave as default (npm install)

6. Add Environment Variables:
   - Click on "Environment Variables"
   - Add the following variables:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your MongoDB connection string |
   | `JWT_SECRET` | The secret you generated |
   | `NODE_ENV` | `production` |
   | `GEMINI_API_KEY` | (Optional) Your Gemini API key if using AI features |

7. Click "Deploy"
8. Wait for deployment to complete (usually 2-3 minutes)
9. Once complete, you'll get a URL like `https://your-app.vercel.app`

## Post-Deployment

### Test the Deployment

1. Open your app URL in browser
2. Create a new account
3. Test file upload:
   - Upload a test file
   - Enter a passphrase
   - Verify upload succeeds
4. Test file download/decrypt:
   - Go to Library
   - Click on the uploaded file
   - Enter the same passphrase
   - Verify download succeeds

### Monitor Your App

1. In Vercel dashboard, go to your project
2. View logs by clicking "Deployments"
3. Click the latest deployment to see build/runtime logs
4. Use the "Function Logs" tab to debug API calls

### Troubleshooting

**502 Bad Gateway Error**
- Check MongoDB connection string in environment variables
- Verify MongoDB IP whitelist includes Vercel's IP ranges (use 0.0.0.0/0 for testing)

**413 Payload Too Large**
- Upgrade Vercel plan or split large files
- Current limit: 500MB per request

**Timeout Errors**
- Free Vercel plan has 10-second timeout for requests
- Consider upgrading to Pro for 60-second timeout
- Split large uploads into chunks

**Database Connection Errors**
- Verify MongoDB connection string is correct
- Check username/password contains no special characters that need URL encoding
- Ensure database user has correct permissions

## Local Development

For local testing before deployment:

```bash
# Create .env file with MongoDB and JWT settings
cp .env.example .env

# Install dependencies
npm install

# Run development server
npm run dev
```

## Security Notes

- Never commit `.env` to git
- Keep MongoDB credentials secure
- Use strong JWT_SECRET
- Enable IP whitelist on MongoDB (restrict to Vercel IPs)
- For production, use environment-specific secrets

## Need Help?

- Check Vercel docs: https://vercel.com/docs
- MongoDB docs: https://docs.mongodb.com
- GitHub discussions for this project
