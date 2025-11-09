# Frontend Deployment Guide

This guide will help you set up automated deployment of your React frontend to S3 + CloudFront using GitHub Actions.

## Step-by-Step Setup

### Step 1: Create AWS Infrastructure

Run the infrastructure creation script:

```bash
cd infrastructure
./create-frontend-infrastructure.sh
```

This script will:
- ✅ Create an S3 bucket for static website hosting
- ✅ Configure the bucket for public access
- ✅ Create a CloudFront distribution for global CDN
- ✅ Output the values you need for GitHub secrets

### Step 2: Add GitHub Secrets

Go to your GitHub repository settings:
`https://github.com/kuldipkumar/acw/settings/secrets/actions`

Add these secrets (the script will output the exact values):

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `FRONTEND_S3_BUCKET_NAME` | S3 bucket for hosting | `acw-frontend-1703123456` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID | `E1234567890ABC` |
| `REACT_APP_API_BASE_URL` | Your backend API URL | `https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/dev/api` |

### Step 3: Update Your Frontend Environment

Make sure your `frontend/.env` file has the correct API URL:

```env
REACT_APP_API_BASE_URL=https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/dev/api
```

### Step 4: Deploy

The deployment will trigger automatically when you:
- Push changes to the `frontend/` folder
- Or manually trigger the workflow from GitHub Actions

## What Happens During Deployment

1. **Build**: Creates an optimized production build of your React app
2. **Deploy to S3**: Uploads files to your S3 bucket with proper caching headers
3. **Invalidate CloudFront**: Clears the CDN cache so changes are visible immediately

## Accessing Your Website

After deployment, your website will be available at:

- **S3 Direct URL**: `http://your-bucket-name.s3-website-ap-south-1.amazonaws.com`
- **CloudFront URL**: `https://your-distribution-id.cloudfront.net` (recommended)

## Caching Strategy

- **Static assets** (JS, CSS, images): Cached for 1 year
- **HTML files**: No cache (always fresh)
- **Service worker**: No cache (for PWA updates)

## Troubleshooting

### Build Fails
- Check that all dependencies are in `frontend/package.json`
- Ensure `REACT_APP_API_BASE_URL` is set correctly

### 404 Errors on Refresh
- The CloudFront distribution is configured to serve `index.html` for 404s
- This enables client-side routing to work properly

### Changes Not Visible
- CloudFront cache invalidation runs automatically
- Changes may take 1-2 minutes to propagate globally

## Manual Commands

If you need to deploy manually:

```bash
# Build the app
cd frontend
npm run build

# Deploy to S3
aws s3 sync build/ s3://your-bucket-name/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```
