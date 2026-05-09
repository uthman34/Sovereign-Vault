<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/449bb897-1b03-48b0-83c8-59fd6fa8e474

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sovereign_archive

# JWT secret for token signing
JWT_SECRET=your-secret-key-here-use-a-strong-random-string

# Optional: Gemini AI API key
GEMINI_API_KEY=your-gemini-api-key

# Node environment
NODE_ENV=production
```

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and create a new project
3. Select your repository
4. Add environment variables in Vercel dashboard:
    - `MONGODB_URI`: Your MongoDB Atlas connection string
    - `JWT_SECRET`: A strong random secret
    - `GEMINI_API_KEY`: Optional, for AI features
5. Click Deploy

### Important Notes for Vercel:

- **File Storage**: Files are stored directly in MongoDB as encrypted binary data, not on disk
- **API Routes**: Backend APIs are serverless functions in the `/api/` directory
- **Timeout**: Default timeout is 60 seconds; large file uploads may need Pro plan
- **Cold Starts**: First API call after inactivity may have a slight delay

## Architecture

- **Frontend**: React app built with Vite, deployed to Vercel
- **Backend**: Express.js API routes as Vercel serverless functions
- **Database**: MongoDB Atlas for persistent storage
- **Encryption**: AES-256-GCM client-side encryption before upload

## File Upload Flow

1. User selects file and enters master passphrase
2. File is encrypted locally in the browser (AES-256)
3. Encrypted blob is converted to base64 and sent as JSON to `/api/upload`
4. Server stores encrypted data in MongoDB
5. Audit log entry is created

## File Download & Decrypt Flow

1. User selects file and enters passphrase
2. Frontend requests encrypted data from `/api/files/:id/download`
3. Server returns binary data from MongoDB
4. Frontend decrypts using the same passphrase (AES-256)
5. Decrypted file is downloaded to user's device

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in and get JWT token
- `GET /api/auth/me` - Get current user profile

### Files
- `POST /api/upload` - Upload encrypted file
- `GET /api/files` - List user's files
- `GET /api/files/:id/download` - Download encrypted file
- `DELETE /api/files/:id` - Delete file

### System
- `GET /api/health` - Health check endpoint
- `GET /api/logs` - Get audit logs
