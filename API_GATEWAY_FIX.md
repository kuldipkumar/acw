# API Gateway Quick Fix Guide

## 🎯 Problem

- API Gateway routes exist but return 404
- Routes are not under `/api` path as frontend expects
- API not properly deployed to a stage

---

## ✅ Solution: Deploy and Restructure

### **Phase 1: Deploy Current Setup (5 minutes)**

#### Step 1: Deploy to `prod` Stage

1. Go to **AWS Console** → **API Gateway**
2. Select your API: `cakes` (ID: `lcs5qocz3b`)
3. Click **"Stages"** in left sidebar
4. Check if `prod` stage exists:
   - **If YES:** Note the invoke URL and skip to Step 2
   - **If NO:** Continue below

5. Click **"Resources"** in left sidebar
6. Click **"Actions"** → **"Deploy API"**
7. Configure:
   - **Deployment stage:** `[New Stage]`
   - **Stage name:** `prod`
   - **Stage description:** "Production stage"
8. Click **"Deploy"**

9. Go back to **"Stages"** → Click `prod`
10. Copy the **"Invoke URL"** (should be: `https://h9sqgvawk0.execute-api.ap-south-1.amazonaws.com/prod`)

#### Step 2: Test Current Routes

```bash
# Test existing /cakes route
curl https://h9sqgvawk0.execute-api.ap-south-1.amazonaws.com/prod/cakes

# Should return JSON with cakes data
```

If this works, proceed to Phase 2. If not, check CloudWatch Logs for the Lambda function.

---

### **Phase 2: Create `/api` Structure (10 minutes)**

#### Step 1: Create `/api` Resource

1. In **"Resources"**, click on `/` (root)
2. Click **"Create resource"** (or "Actions" → "Create Resource")
3. Configure:
   - **Resource name:** `api`
   - **Resource path:** `api`
   - **Enable API Gateway CORS:** ✅ Check this
4. Click **"Create resource"**

#### Step 2: Create `/api/cakes` Resource

1. Click on `/api` resource
2. Click **"Create resource"**
3. Configure:
   - **Resource name:** `cakes`
   - **Resource path:** `cakes`
4. Click **"Create resource"**

#### Step 3: Add GET Method to `/api/cakes`

1. Select `/api/cakes` resource
2. Click **"Create method"** (or "Actions" → "Create Method")
3. Select **GET** from dropdown, click ✓
4. Configure:
   - **Integration type:** Lambda Function
   - **Use Lambda Proxy integration:** ✅ **MUST CHECK THIS!**
   - **Lambda Function:** `acw-get-cakes-lambda`
   - **Lambda Region:** `ap-south-1`
5. Click **"Save"**
6. Click **"OK"** to grant permissions

#### Step 4: Enable CORS on `/api/cakes`

1. With `/api/cakes` selected
2. Click **"Actions"** → **"Enable CORS"**
3. Configure:
   - **Access-Control-Allow-Methods:** Check `GET` and `OPTIONS`
   - **Access-Control-Allow-Headers:** `Content-Type,Authorization`
   - **Access-Control-Allow-Origin:** `*`
4. Click **"Enable CORS and replace existing CORS headers"**
5. Click **"Yes, replace existing values"**

#### Step 5: Create `/api/upload` Resource

1. Click on `/api` resource
2. Click **"Create resource"**
3. Configure:
   - **Resource name:** `upload`
   - **Resource path:** `upload`
4. Click **"Create resource"**

#### Step 6: Add POST Method to `/api/upload`

1. Select `/api/upload` resource
2. Click **"Create method"** → Select **POST**, click ✓
3. Configure:
   - **Integration type:** Lambda Function
   - **Use Lambda Proxy integration:** ✅ **MUST CHECK THIS!**
   - **Lambda Function:** `acw-upload-lambda`
   - **Lambda Region:** `ap-south-1`
4. Click **"Save"**
5. Click **"OK"** to grant permissions

#### Step 7: Enable CORS on `/api/upload`

1. With `/api/upload` selected
2. Click **"Actions"** → **"Enable CORS"**
3. Configure:
   - **Access-Control-Allow-Methods:** Check `POST` and `OPTIONS`
   - **Access-Control-Allow-Headers:** `Content-Type,Authorization`
   - **Access-Control-Allow-Origin:** `*`
4. Click **"Enable CORS and replace existing CORS headers"**
5. Click **"Yes, replace existing values"**

#### Step 8: Verify `/api/auth/login` Exists

1. Check if `/api/auth/login` resource exists in the tree
2. If it exists:
   - Click on it
   - Verify POST method exists
   - Enable CORS (same as above)
3. If it doesn't exist:
   - Create `/api/auth` resource under `/api`
   - Create `/api/auth/login` resource under `/api/auth`
   - Add POST method → `acw-auth-lambda`
   - Enable CORS

#### Step 9: Deploy to `prod` Stage

1. Click **"Actions"** → **"Deploy API"**
2. **Deployment stage:** `prod`
3. **Deployment description:** "Added /api routes for frontend compatibility"
4. Click **"Deploy"**

---

### **Phase 3: Test New Routes (2 minutes)**

```bash
# Test /api/cakes
curl https://h9sqgvawk0.execute-api.ap-south-1.amazonaws.com/prod/api/cakes

# Test /api/auth/login
curl -X POST https://h9sqgvawk0.execute-api.ap-south-1.amazonaws.com/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"Alka@1612!"}'

# Test CORS on /api/cakes
curl -X OPTIONS https://h9sqgvawk0.execute-api.ap-south-1.amazonaws.com/prod/api/cakes \
  -H "Origin: https://d2xceew7nmso6e.cloudfront.net" \
  -H "Access-Control-Request-Method: GET" \
  -i
```

**Expected:** All should return 200 with proper responses and CORS headers.

---

### **Phase 4: Update CloudFront (5 minutes)**

#### Step 1: Find CloudFront Distribution

1. Go to **AWS Console** → **CloudFront**
2. Find distribution: `d2xceew7nmso6e`
3. Click on it

#### Step 2: Check Current Origins

1. Click **"Origins"** tab
2. Look for an origin with domain: `h9sqgvawk0.execute-api.ap-south-1.amazonaws.com`
3. Note the **Origin path** value

#### Step 3: Update Origin Path

1. Select the API Gateway origin
2. Click **"Edit"**
3. **Origin path:** `/prod`
4. Click **"Save changes"**

#### Step 4: Check Behaviors

1. Click **"Behaviors"** tab
2. Look for a behavior with **Path pattern:** `/api/*`
3. If it exists:
   - Click **"Edit"**
   - Verify **Origin** points to your API Gateway origin
   - **Cache policy:** `CachingDisabled` (for API routes)
   - **Origin request policy:** `AllViewer`
   - Click **"Save changes"**
4. If it doesn't exist:
   - Click **"Create behavior"**
   - **Path pattern:** `/api/*`
   - **Origin:** Select your API Gateway origin
   - **Viewer protocol policy:** `Redirect HTTP to HTTPS`
   - **Allowed HTTP methods:** `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
   - **Cache policy:** `CachingDisabled`
   - **Origin request policy:** `AllViewer`
   - Click **"Create behavior"**

#### Step 5: Create Invalidation

1. Click **"Invalidations"** tab
2. Click **"Create invalidation"**
3. **Object paths:** `/*`
4. Click **"Create invalidation"**
5. Wait 2-3 minutes for completion

---

### **Phase 5: Test Through CloudFront (2 minutes)**

```bash
# Test cakes through CloudFront
curl https://d2xceew7nmso6e.cloudfront.net/api/cakes

# Test auth through CloudFront
curl -X POST https://d2xceew7nmso6e.cloudfront.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"Alka@1612!"}'

# Test CORS through CloudFront
curl -X OPTIONS https://d2xceew7nmso6e.cloudfront.net/api/cakes \
  -H "Origin: https://d2xceew7nmso6e.cloudfront.net" \
  -H "Access-Control-Request-Method: GET" \
  -i
```

**Expected:** All should work with CORS headers.

---

### **Phase 6: Test Website (1 minute)**

1. Open: https://d2xceew7nmso6e.cloudfront.net
2. Check if cakes load on homepage
3. Go to: https://d2xceew7nmso6e.cloudfront.net/admin
4. Try logging in with password: `Alka@1612!`
5. Try uploading an image

**Everything should work!** ✅

---

## 🗑️ Optional: Clean Up Old Routes

After verifying everything works:

1. Go to API Gateway → Resources
2. Delete the old `/cakes` resource (root level)
3. Deploy API again
4. Create CloudFront invalidation

---

## 📊 Final API Structure

```
/
└── /api
    ├── /auth
    │   └── /login
    │       ├── OPTIONS (Mock)
    │       └── POST (Lambda: acw-auth-lambda)
    ├── /cakes
    │   ├── OPTIONS (Mock)
    │   └── GET (Lambda: acw-get-cakes-lambda)
    └── /upload
        ├── OPTIONS (Mock)
        └── POST (Lambda: acw-upload-lambda)
```

---

## 🔍 Troubleshooting

### Issue: Routes still return 404

**Solution:** Make sure you deployed the API after making changes!
- Go to Resources → Actions → Deploy API → Select `prod` → Deploy

### Issue: CORS errors persist

**Solution:** 
1. Verify CORS is enabled on each resource
2. Check Lambda Proxy Integration is enabled
3. Deploy API after enabling CORS
4. Clear browser cache or test in incognito

### Issue: CloudFront returns old responses

**Solution:**
1. Create CloudFront invalidation for `/*`
2. Wait 2-3 minutes
3. Test again

### Issue: Lambda not found error

**Solution:**
1. Verify Lambda function names are correct
2. Check Lambda functions exist in the same region (ap-south-1)
3. Grant API Gateway permission to invoke Lambda

---

## ⏱️ Total Time

- Phase 1: 5 minutes
- Phase 2: 10 minutes
- Phase 3: 2 minutes
- Phase 4: 5 minutes
- Phase 5: 2 minutes
- Phase 6: 1 minute

**Total: ~25 minutes**

---

## ✅ Success Criteria

- [ ] `/prod/api/cakes` returns cakes data
- [ ] `/prod/api/auth/login` returns token with correct password
- [ ] `/prod/api/upload` accepts file uploads
- [ ] All routes return CORS headers
- [ ] CloudFront routes `/api/*` to API Gateway
- [ ] Website loads cakes on homepage
- [ ] Admin login works
- [ ] Image upload works

---

**Good luck!** 🚀
