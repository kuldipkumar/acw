# Add Update Metadata Route to API Gateway

The `acw-update-metadata` Lambda function has been deployed, but it needs to be connected to API Gateway.

## Current API Routes

Your API Gateway currently has these routes:
- ✅ `GET /api/cakes` → `acw-get-cakes-lambda`
- ✅ `POST /api/upload` → `acw-upload-lambda`
- ✅ `POST /api/auth/login` → `acw-auth-lambda`

## New Route Needed

- ⚠️ `PUT /api/cakes/{id}` → `acw-update-metadata` (needs to be added)

---

## Step-by-Step Instructions

### Step 1: Go to API Gateway Console

1. Open AWS Console
2. Go to **API Gateway** service
3. Find your API (check your `REACT_APP_API_BASE_URL` for the API ID)
   - Example: `https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com`
   - API ID is: `lcs5qocz3b`

### Step 2: Create the Route

#### For HTTP API (Recommended):

1. Click on your API
2. Click **"Routes"** in the left sidebar
3. Click **"Create"** button
4. Configure:
   - **Method:** `PUT`
   - **Path:** `/api/cakes/{id}`
5. Click **"Create"**

#### For REST API (Alternative):

1. Click on your API
2. Click **"Resources"** in the left sidebar
3. Find or create `/api/cakes` resource
4. Select `/api/cakes`
5. Click **"Actions"** → **"Create Resource"**
   - Resource Name: `{id}`
   - Resource Path: `{id}`
   - ✅ Enable **"Configure as proxy resource"** if available
6. Select `/api/cakes/{id}`
7. Click **"Actions"** → **"Create Method"** → Select `PUT`

### Step 3: Configure Lambda Integration

1. Click on the newly created `PUT /api/cakes/{id}` route
2. Click **"Create Integration"** or **"Integration Request"**
3. Configure:
   - **Integration type:** Lambda Function
   - **Lambda Function:** `acw-update-metadata`
   - **Lambda Region:** `ap-south-1` (or your region)
   - **Use Lambda Proxy integration:** ✅ **MUST be enabled!**
4. Click **"Create"** or **"Save"**

### Step 4: Grant API Gateway Permission

AWS will prompt you to grant permission. Click **"OK"** or **"Add Permission"**.

If not prompted, run this AWS CLI command:
```bash
aws lambda add-permission \
  --function-name acw-update-metadata \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-south-1:YOUR_ACCOUNT_ID:YOUR_API_ID/*/PUT/api/cakes/*" \
  --region ap-south-1
```

### Step 5: Enable CORS

#### For HTTP API:

1. Go to **"CORS"** in the left sidebar
2. Add to **Access-Control-Allow-Methods:** `PUT`
3. Ensure these are set:
   - **Access-Control-Allow-Origin:** `*` (or your domain)
   - **Access-Control-Allow-Headers:** `Content-Type, Authorization`
   - **Access-Control-Max-Age:** `86400`
4. Click **"Save"**

#### For REST API:

1. Select `/api/cakes/{id}` resource
2. Click **"Actions"** → **"Enable CORS"**
3. Configure:
   - **Access-Control-Allow-Methods:** Check `PUT` and `OPTIONS`
   - **Access-Control-Allow-Headers:** `Content-Type,Authorization`
   - **Access-Control-Allow-Origin:** `*`
4. Click **"Enable CORS and replace existing CORS headers"**

### Step 6: Deploy API

**CRITICAL:** Changes don't take effect until you deploy!

#### For HTTP API:

1. API is auto-deployed (check if auto-deploy is enabled)
2. Or manually deploy:
   - Click **"Deployments"** in left sidebar
   - Click **"Create"**
   - Select stage (usually `$default` or `prod`)
   - Click **"Deploy"**

#### For REST API:

1. Click **"Actions"** → **"Deploy API"**
2. Select **Deployment stage** (e.g., `prod` or `default`)
3. Add deployment description: "Added update-metadata route"
4. Click **"Deploy"**

### Step 7: Test the Integration

1. Go to your website's admin panel
2. Click **"Edit"** on any image
3. Try changing:
   - Title
   - Description
   - Tags
   - **Set as Landing Page Image** checkbox
4. Click **"Save"**

If it works without errors, the route is properly configured! ✅

---

## Troubleshooting

### Error: "Missing Authentication Token"
- Route path doesn't match
- Check: `/api/cakes/{id}` (not `/cakes/{id}`)

### Error: "Internal Server Error"
- Lambda not properly integrated
- Check: Lambda proxy integration is enabled
- Check: Lambda has S3 permissions

### Error: CORS issues
- CORS not enabled for PUT method
- Check: OPTIONS method is configured
- Check: Response headers include CORS headers

### Error: "Forbidden" or 403
- API Gateway doesn't have permission to invoke Lambda
- Run the `add-permission` command from Step 4

---

## Verify Lambda Permissions

The Lambda needs these permissions (should already be set via IAM role):
- `s3:GetObject`
- `s3:PutObject`
- `s3:CopyObject`
- `s3:HeadObject`
- `s3:ListBucket`

Check the Lambda's execution role in IAM console.
