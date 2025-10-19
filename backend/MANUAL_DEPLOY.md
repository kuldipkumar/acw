# Manual Lambda Deployment Guide

Your AWS user doesn't have Lambda/IAM permissions via CLI. Follow these steps to deploy via AWS Console.

## Step 1: Package the Lambda Functions

Run this to create deployment packages:

```bash
cd backend

# Package auth-lambda
mkdir -p .deploy/auth-lambda
cp auth-lambda.js .deploy/auth-lambda/index.js
cd .deploy/auth-lambda
npm install bcryptjs --production
zip -r ../auth-lambda.zip .
cd ../..

# Package upload-lambda  
mkdir -p .deploy/upload-lambda
cp upload-to-s3-lambda.js .deploy/upload-lambda/index.js
cd .deploy/upload-lambda
npm install aws-sdk uuid lambda-multipart-parser --production
zip -r ../upload-lambda.zip .
cd ../..

echo "✅ Packages created in backend/.deploy/"
```

## Step 2: Deploy Auth Lambda (AWS Console)

1. **Go to AWS Lambda Console**: https://console.aws.amazon.com/lambda/
2. **Click "Create function"**
3. **Configure:**
   - Function name: `acw-auth-lambda`
   - Runtime: `Node.js 18.x`
   - Architecture: `x86_64`
   - Execution role: Use existing role (find one that has basic Lambda permissions)
4. **Click "Create function"**
5. **Upload code:**
   - Click "Upload from" → ".zip file"
   - Select `backend/.deploy/auth-lambda.zip`
   - Click "Save"
6. **Add environment variable:**
   - Go to "Configuration" tab → "Environment variables"
   - Click "Edit" → "Add environment variable"
   - Key: `ADMIN_PASSWORD_HASH`
   - Value: `$2b$10$WmEUgRKfbeadii5vwWU2getFPswmr6fDSVnyu8v6DBO8KJ4WlKiX6`
   - Click "Save"
7. **Test the function:**
   - Go to "Test" tab
   - Create test event with:
   ```json
   {
     "body": "{\"password\":\"Alka@1612!\"}",
     "httpMethod": "POST"
   }
   ```
   - Click "Test"
   - Should return success with token

## Step 3: Update Upload Lambda

1. **Find your existing upload Lambda function** in the console
   - It might be named: `upload-to-s3`, `acw-upload`, or similar
2. **Click on the function**
3. **Upload new code:**
   - Click "Upload from" → ".zip file"
   - Select `backend/.deploy/upload-lambda.zip`
   - Click "Save"
4. **No environment variables needed** (it uses existing S3 config)

## Step 4: Configure API Gateway

1. **Go to API Gateway Console**: https://console.aws.amazon.com/apigateway/
2. **Select your API** (probably named `acw-api` or similar)
3. **Create Auth Route:**
   - Click "Create Resource" or "Create Route"
   - Method: `POST`
   - Resource path: `/api/auth/login` or `/auth/login`
   - Integration type: Lambda Function
   - Lambda function: `acw-auth-lambda`
   - Enable CORS: Yes
   - Click "Create"
4. **Update Upload Route (if needed):**
   - Find existing upload route (might be `/api/cakes` or `/api/upload`)
   - If it's `/api/cakes`, change to `/api/upload`
   - Make sure it points to your upload Lambda function
   - Enable CORS with `Authorization` header allowed
5. **Deploy API:**
   - Click "Deploy API"
   - Stage: `prod` or `default`
   - Click "Deploy"
6. **Note your API URL** - you'll need this

## Step 5: Update Frontend Environment

Your frontend needs to know the API URL. This is configured in GitHub Secrets:

1. **Go to GitHub**: https://github.com/kuldipkumar/acw
2. **Settings** → **Secrets and variables** → **Actions**
3. **Update or create:**
   - `REACT_APP_API_BASE_URL` = `https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com`
   - `ADMIN_PASSWORD_HASH` = `$2b$10$WmEUgRKfbeadii5vwWU2getFPswmr6fDSVnyu8v6DBO8KJ4WlKiX6`

## Step 6: Redeploy Frontend

Trigger a new deployment:

```bash
git commit --allow-empty -m "trigger deployment"
git push origin main
```

Or manually trigger the GitHub Actions workflow.

## Step 7: Test Everything

1. **Visit your website**: https://www.alkascakewalk.com/admin
2. **Try to login** with password: `Alka@1612!`
3. **Should see admin dashboard**
4. **Try uploading an image**

## Troubleshooting

### Can't find existing upload Lambda?
Look for functions with names like:
- `upload-to-s3`
- `acw-upload`
- `cakewalk-upload`

### Can't find API Gateway?
Look for APIs with names like:
- `acw-api`
- `cakewalk-api`
- Check the API ID in your current frontend .env

### Login still doesn't work?
1. Check CloudWatch Logs for the auth-lambda
2. Verify password hash is correct in environment variables
3. Check API Gateway CORS settings
4. Verify the route is `/api/auth/login`

### Need the API Gateway URL?
Check your current frontend deployment or:
1. Go to API Gateway Console
2. Select your API
3. Click "Stages"
4. Copy the "Invoke URL"

---

**Password for testing:** `Alka@1612!`

**Password hash:** `$2b$10$WmEUgRKfbeadii5vwWU2getFPswmr6fDSVnyu8v6DBO8KJ4WlKiX6`
