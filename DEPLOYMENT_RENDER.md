Render deployment steps

1. Create a new Web Service on Render (service type: Web Service).
2. Connect your GitHub repository and select the branch to deploy.
3. Set the Build Command to:

   npm run build

4. Set the Start Command to:

   npm start

5. Add the following Environment Variables on Render:

   - MONGODB_URI: your MongoDB connection string
   - JWT_SECRET: a secure random secret
   - CLIENT_URL: https://your-frontend-url (optional)
   - GMAIL_USER and GMAIL_PASS: for email service (optional)
   - CLOUDINARY_CLOUD_NAME: your Cloudinary cloud name
   - CLOUDINARY_API_KEY: your Cloudinary API key
   - CLOUDINARY_API_SECRET: your Cloudinary API secret
   - CLOUDINARY_FOLDER: optional Cloudinary folder name
   - NODE_ENV: production

6. Uploads now go to Cloudinary automatically when those variables are set. If they are missing, the app falls back to local `uploads/` storage for development.

7. Deploy and monitor logs on Render. The app will start using `node server.js`.

8. Verify `/api/health` and frontend connectivity. Ensure `sv_token` JWT issuance and routes work.
