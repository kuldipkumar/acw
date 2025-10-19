# CORS Debugging Guide for Auth Endpoint

## 🔍 Step-by-Step CORS Troubleshooting

### Step 1: Verify the Exact CORS Error

Open your browser console (F12) and check the exact error message. It should look like one of these:

**Error Type A:**
```
Access to fetch at 'https://xxx.execute-api.ap-south-1.amazonaws.com/api/auth/login' 
from origin 'https://www.alkascakewalk.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Error Type B:**
```
Access to fetch at 'https://xxx.execute-api.ap-south-1.amazonaws.com/api/auth/login' 
from origin 'https://www.alkascakewalk.com' has been blocked by CORS policy: 
Request header field content-type is not allowed by Access-Control-Allow-Headers 
in preflight response.
```

---

### Step 2: Test the Endpoint Directly

#### Test 1: OPTIONS Request (Preflight)

```bash
curl -X OPTIONS https://YOUR_API_URL/api/auth/login \
  -H "Origin: https://www.alkascakewalk.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Expected Response Headers:**
```
< HTTP/2 200
< access-control-allow-origin: *
< access-control-allow-methods: POST, OPTIONS
< access-control-allow-headers: Content-Type, Authorization
< access-control-max-age: 86400
```

#### Test 2: POST Request

```bash
curl -X POST https://YOUR_API_URL/api/auth/login \
  -H "Origin: https://www.alkascakewalk.com" \
  -H "Content-Type: application/json" \
  -d '{"password":"Alka@1612!"}' \
  -v
```

**Expected Response Headers:**
```
< HTTP/2 200
< access-control-allow-origin: *
< access-control-allow-methods: POST, OPTIONS
< access-control-allow-headers: Content-Type, Authorization
< content-type: application/json
```

---

### Step 3: Check API Gateway CORS Configuration

The issue is most likely in **API Gateway**, not the Lambda function.

#### For HTTP API:

1. Go to **AWS Console** → **API Gateway**
2. Select your API
3. Click **"CORS"** in the left sidebar
4. Verify these settings:

   **Access-Control-Allow-Origin:**
   ```
   *
   ```
   Or specifically:
   ```
   https://www.alkascakewalk.com
   ```

   **Access-Control-Allow-Methods:**
   ```
   POST, OPTIONS
   ```

   **Access-Control-Allow-Headers:**
   ```
   Content-Type, Authorization
   ```

   **Access-Control-Max-Age:**
   ```
   86400
   ```

5. Click **"Save"**

#### For REST API:

1. Go to **AWS Console** → **API Gateway**
2. Select your API
3. Select the `/api/auth/login` resource
4. Click **"Actions"** → **"Enable CORS"**
5. Configure:
   - **Access-Control-Allow-Methods:** Check `POST` and `OPTIONS`
   - **Access-Control-Allow-Headers:** `Content-Type,Authorization`
   - **Access-Control-Allow-Origin:** `*` or `https://www.alkascakewalk.com`
6. Click **"Enable CORS and replace existing CORS headers"**
7. **IMPORTANT:** Click **"Actions"** → **"Deploy API"** to apply changes!

---

### Step 4: Verify Lambda Proxy Integration

CORS headers from Lambda only work if you're using **Lambda Proxy Integration**.

1. Go to **API Gateway** → Your API → Routes/Resources
2. Click on `/api/auth/login` → `POST` method
3. Check **Integration type**
4. Should be: **Lambda Function** with **"Use Lambda Proxy integration"** ✅ ENABLED

If not enabled:
- Edit the integration
- Check **"Use Lambda Proxy integration"**
- Save and **Deploy API**

---

### Step 5: Common CORS Fixes

#### Fix 1: API Gateway Not Deployed

**Problem:** You configured CORS but didn't deploy the API.

**Solution:**
1. Go to API Gateway
2. Click **"Deploy API"** or **"Actions"** → **"Deploy API"**
3. Select stage: `prod` or `default`
4. Click **"Deploy"**

#### Fix 2: OPTIONS Method Not Configured

**Problem:** API Gateway doesn't have an OPTIONS method for the route.

**Solution for HTTP API:**
- CORS configuration should automatically handle OPTIONS
- Make sure CORS is enabled in API Gateway settings

**Solution for REST API:**
1. Select `/api/auth/login` resource
2. Click **"Actions"** → **"Create Method"** → Select `OPTIONS`
3. Integration type: **Mock**
4. Save
5. Enable CORS on the resource
6. Deploy API

#### Fix 3: Wrong Origin

**Problem:** Your frontend is on `https://www.alkascakewalk.com` but CORS only allows a different origin.

**Solution:**
- Set `Access-Control-Allow-Origin` to `*` (allows all origins)
- Or specifically: `https://www.alkascakewalk.com`

#### Fix 4: Missing Content-Type Header

**Problem:** `Content-Type` is not in the allowed headers list.

**Solution:**
- Add `Content-Type` to `Access-Control-Allow-Headers`
- Should be: `Content-Type, Authorization`

---

### Step 6: Check CloudFront (If Using)

If your API is behind CloudFront:

1. Go to **CloudFront** → Your distribution
2. Click **"Behaviors"** tab
3. Edit the behavior for your API path
4. Scroll to **"Cache key and origin requests"**
5. Under **"Cache policy"**, select **"CachingDisabled"** for API routes
6. Under **"Origin request policy"**, select **"AllViewer"**
7. Save and wait for deployment

---

### Step 7: Verify Lambda Response Format

The Lambda MUST return responses in this exact format:

```javascript
return {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
  body: JSON.stringify({ success: true, token: 'xxx' })
};
```

Check your `auth-lambda.js` follows this format (it does ✅).

---

## 🔧 Quick Fix Checklist

Try these in order:

- [ ] **1. Deploy API Gateway** (most common issue!)
  ```
  API Gateway → Actions → Deploy API → Select stage → Deploy
  ```

- [ ] **2. Enable CORS in API Gateway**
  ```
  API Gateway → CORS → Configure → Save
  ```

- [ ] **3. Verify Lambda Proxy Integration is enabled**
  ```
  API Gateway → Route → Integration → Check "Use Lambda Proxy integration"
  ```

- [ ] **4. Check the route path is correct**
  ```
  Should be: /api/auth/login (not /auth/login)
  ```

- [ ] **5. Clear browser cache and test in incognito**
  ```
  Sometimes old CORS errors are cached
  ```

---

## 🧪 Testing Commands

Replace `YOUR_API_URL` with your actual API Gateway URL:

### Test OPTIONS (Preflight):
```bash
curl -X OPTIONS https://YOUR_API_URL/api/auth/login \
  -H "Origin: https://www.alkascakewalk.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i
```

### Test POST:
```bash
curl -X POST https://YOUR_API_URL/api/auth/login \
  -H "Origin: https://www.alkascakewalk.com" \
  -H "Content-Type: application/json" \
  -d '{"password":"Alka@1612!"}' \
  -i
```

### Check Response Headers:
Look for these headers in the response:
```
access-control-allow-origin: *
access-control-allow-methods: POST, OPTIONS
access-control-allow-headers: Content-Type, Authorization
```

---

## 📋 What to Check in Browser Console

1. Open **Developer Tools** (F12)
2. Go to **Network** tab
3. Try logging in
4. Look for the `/auth/login` request
5. Check:
   - **Request Headers** - Should have `Origin: https://www.alkascakewalk.com`
   - **Response Headers** - Should have `access-control-allow-origin: *`
   - **Status** - Should be 200 for OPTIONS and POST

---

## 🎯 Most Likely Solution

**99% of the time, the issue is:**

1. **API Gateway CORS not configured** - Go to API Gateway → CORS → Configure
2. **API Gateway not deployed** - Go to API Gateway → Deploy API
3. **Lambda Proxy Integration not enabled** - Go to Integration settings → Enable it

**After making ANY change in API Gateway, you MUST deploy the API!**

---

## 💡 Need More Help?

If the issue persists:

1. Share the exact CORS error from browser console
2. Share the output of the OPTIONS curl command
3. Share your API Gateway URL
4. Check CloudWatch Logs for the Lambda function

---

**Quick Test:** Try this in your browser console on the website:

```javascript
fetch('https://YOUR_API_URL/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'Alka@1612!' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

If this works, the issue is in your frontend code. If it fails with CORS, the issue is in API Gateway configuration.
