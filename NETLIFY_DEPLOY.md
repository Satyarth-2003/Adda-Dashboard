# Netlify Deployment Guide

## Prerequisites
1. A Netlify account (sign up at [netlify.com](https://www.netlify.com/))
2. Node.js (v18 or higher) installed locally
3. Git installed locally

## Deployment Steps

### 1. Prepare Your Environment Variables

Before deploying, make sure to set the following environment variables in your Netlify site settings:

```
GEMINI_API_KEY=your_gemini_api_key
SUPADATA_API_TOKEN=your_supadata_api_token
YOUTUBE_API_KEY=your_youtube_api_key
NODE_ENV=production
```

### 2. Deploy to Netlify

#### Option A: Deploy using Netlify CLI (Recommended)

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to your Netlify account:
   ```bash
   netlify login
   ```

3. Build the project:
   ```bash
   npm install
   npm run build
   ```

4. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

#### Option B: Deploy via Git

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to your Netlify account

3. Click "New site from Git"

4. Select your Git provider and repository

5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

6. Click "Deploy site"

### 3. Set Up Environment Variables

1. Go to your site in the Netlify dashboard
2. Navigate to "Site settings" > "Build & deploy" > "Environment"
3. Add the environment variables mentioned in step 1
4. Trigger a new deploy to apply the environment variables

### 4. Configure Redirects

Netlify will automatically use the `netlify.toml` configuration file for redirects. Make sure it's properly configured to handle both the frontend and API routes.

### 5. Verify Deployment

After deployment, you can verify everything is working by:

1. Visiting your site URL
2. Checking the health endpoint: `https://your-site.netlify.app/api/health`
3. Testing the API endpoints

## Troubleshooting

- If you encounter build errors, check the build logs in the Netlify dashboard
- Make sure all environment variables are correctly set
- Ensure your API keys have the necessary permissions
- Check the browser's developer console for any client-side errors

## Support

For additional help, please contact [your support email].
