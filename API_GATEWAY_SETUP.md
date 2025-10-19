# API Gateway Configuration Guide

After Lambda functions are deployed via GitHub Actions, you need to configure API Gateway routes **once**. This is a one-time manual setup.

---

## Overview

You need to add a new route for the auth Lambda:

- **Existing Routes:**
  - `GET /api/cakes` → `acw-get-cakes-lambda` ✅
  - `POST /api/upload` → `acw-upload-lambda` ✅

- **New Route:**
  - `POST /api/auth/login` → `acw-auth-lambda` ⚠️ (needs to be added)

---

## Step-by-Step Configuration

### Step 1: Find Your API Gateway

1. Go to **AWS Console** → **API Gateway**
2. Look for your existing API (likely named `acw-api` or similar)
3. Note the **API ID** (e.g., `lcs5qocz3b`)

**Tip:** Check your current `REACT_APP_API_BASE_URL` secret to find the API ID:
```
https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com
         ^^^^^^^^^^
         This is your API ID
```

### Step 2: Create Auth Route

#### For HTTP API (Recommended):

1. In API Gateway Console, select your API
2. Click **"Routes"** in the left sidebar
3. Click **"Create"** button
4. Configure the route:
   - **Method:** `POST`
   - **Path:** `/api/auth/login`
5. Click **"Create"**

#### For REST API (Alternative):

1. In API Gateway Console, select your API
2. Click **"Resources"** in the left sidebar
3. Select `/api` resource (or create if missing)
4. Click **"Actions"** → **"Create Resource"**
   - Resource Name: `auth`
   - Resource Path: `auth`
5. Select the new `/api/auth` resource
6. Click **"Actions"** → **"Create Resource"**
   - Resource Name: `login`
   - Resource Path: `login`
7. Select `/api/auth/login`
8. Click **"Actions"** → **"Create Method"** → Select `POST`

### Step 3: Configure Lambda Integration

1. After creating the route, click on it
2. Click **"Create Integration"** or **"Integration Request"**
3. Configure:
   - **Integration type:** Lambda Function
   - **Lambda Function:** `acw-auth-lambda`
   - **Lambda Region:** `ap-south-1` (or your region)
   - **Use Lambda Proxy integration:** ✅ **Enable this!**
4. Click **"Create"** or **"Save"**

### Step 4: Enable CORS

#### For HTTP API:

1. Select your route `/api/auth/login`
2. Click **"Configure CORS"** or go to **CORS settings**
3. Configure:
   - **Access-Control-Allow-Origin:** `*` (or your specific domain)
   - **Access-Control-Allow-Methods:** `POST, OPTIONS`
   - **Access-Control-Allow-Headers:** `Content-Type, Authorization`
   - **Access-Control-Max-Age:** `86400`
4. Click **"Save"**

#### For REST API:

1. Select `/api/auth/login` resource
2. Click **"Actions"** → **"Enable CORS"**
3. Configure:
   - **Access-Control-Allow-Methods:** Check `POST` and `OPTIONS`
   - **Access-Control-Allow-Headers:** Add `Content-Type,Authorization`
   - **Access-Control-Allow-Origin:** `*`
4. Click **"Enable CORS and replace existing CORS headers"**

### Step 5: Deploy API

**IMPORTANT:** Changes don't take effect until you deploy!

#### For HTTP API:

1. Click **"Deploy"** button (top right)
2. Select stage: `$default` or `prod`
3. Click **"Deploy"**

#### For REST API:

1. Click **"Actions"** → **"Deploy API"**
2. Select **Deployment stage:** `prod` or `default`
3. Add **Deployment description:** "Added auth endpoint"
4. Click **"Deploy"**

### Step 6: Verify the Route

Test the new endpoint with curl:

```bash
curl -X POST https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"password":"Alka@1612!"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "YWRtaW46MTcwMzEyMzQ1Njc4OTowLjEyMzQ1Njc4OQ=="
}
```

---

## Verify Existing Routes (Optional)

While you're in API Gateway, verify your existing routes are correct:

### Route 1: Get Cakes
- **Method:** `GET`
- **Path:** `/api/cakes`
- **Integration:** `acw-get-cakes-lambda`
- **CORS:** Enabled

### Route 2: Upload
- **Method:** `POST`
- **Path:** `/api/upload`
- **Integration:** `acw-upload-lambda`
- **CORS:** Enabled with `Authorization` header

---

## Troubleshooting

### "Internal Server Error" (500)
- Check Lambda function exists: `acw-auth-lambda`
- Check CloudWatch Logs for the Lambda
- Verify Lambda has correct environment variable: `ADMIN_PASSWORD_HASH`

### CORS Error
- Make sure CORS is enabled on the route
- Verify `Content-Type` and `Authorization` headers are allowed
- Check the Lambda returns proper CORS headers

### "Missing Authentication Token" (403)
- Route path might be wrong
- Make sure you deployed the API after creating the route
- Verify the full path: `/api/auth/login`

### Route Not Found (404)
- Double-check the route path matches: `/api/auth/login`
- Ensure API was deployed after adding the route
- Verify you're using the correct API Gateway URL

---

## API Gateway URL Format

Your API Gateway URL should look like:

```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/api/auth/login
```

Example:
```
https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/dev/api/auth/login
```

Or without stage (for HTTP API):
```
https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/api/auth/login
```

---

## Testing Checklist

After configuration, test all endpoints:

- [ ] **GET /api/cakes** - Should return list of cakes
- [ ] **POST /api/auth/login** - Should return token with valid password
- [ ] **POST /api/upload** - Should require Authorization header

---

## Next Steps

After API Gateway is configured:

1. ✅ Test auth endpoint with curl
2. ✅ Visit your website: `https://www.alkascakewalk.com/admin`
3. ✅ Try logging in with password: `Alka@1612!`
4. ✅ Test uploading an image

If everything works, you're done! 🎉

---

## Quick Reference

**Password:** `Alka@1612!`

**Test Command:**
```bash
# Test login
curl -X POST https://YOUR_API_URL/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"password":"Alka@1612!"}'

# Test with wrong password (should fail)
curl -X POST https://YOUR_API_URL/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"password":"wrong"}'
```

**CloudWatch Logs:**
- Go to CloudWatch → Log groups
- Find `/aws/lambda/acw-auth-lambda`
- Check for errors or authentication attempts
