# AWS Deployment Checklist

## ✅ Code Committed and Pushed
- Branch: `main`
- Commit: `15a23f9`
- All changes merged successfully

## 🚀 Deployment Steps

### 1. Frontend Deployment (Automatic via GitHub Actions)
The frontend will deploy automatically via the existing GitHub Actions workflow.

**What will deploy:**
- ✅ New favicon (cake icon)
- ✅ Admin menu item in navigation
- ✅ Improved responsive carousel
- ✅ Modal popup for carousel images
- ✅ Login form for admin page
- ✅ Protected admin dashboard
- ✅ Tag cleanup in upload form

**Status:** Will trigger automatically on push to main ✅

---

### 2. Backend Lambda Functions (Manual Deployment Required)

#### A. Deploy New `auth-lambda` Function

**File:** `backend/auth-lambda.js`

**Steps:**
1. Go to AWS Lambda Console
2. Create new function: `acw-auth-lambda`
3. Runtime: Node.js 18.x or later
4. Copy code from `backend/auth-lambda.js`
5. Add environment variable:
   ```
   ADMIN_PASSWORD_HASH=<your_generated_hash>
   ```
6. Configure API Gateway route:
   - Method: POST
   - Path: `/api/auth/login`
   - Integration: Lambda proxy

**Generate password hash:**
```bash
cd backend
node generate-password-hash.js YourSecurePassword
```

---

#### B. Update `upload-to-s3-lambda` Function

**File:** `backend/upload-to-s3-lambda.js`

**Changes:**
- Added authentication check (requires Bearer token)
- Added CORS preflight handling

**Steps:**
1. Go to AWS Lambda Console
2. Open existing `upload-to-s3-lambda` function
3. Replace code with updated `backend/upload-to-s3-lambda.js`
4. Deploy changes

**Note:** This will require authentication for uploads now!

---

#### C. Update API Gateway Routes

**Required changes:**

1. **Add new route:**
   - Path: `POST /api/auth/login`
   - Integration: `acw-auth-lambda`
   - CORS: Enabled

2. **Update existing route (if needed):**
   - Path: `POST /api/upload` (was `/api/cakes`)
   - Integration: `upload-to-s3-lambda`
   - CORS: Enabled with Authorization header

---

### 3. Environment Variables

#### Lambda Environment Variables to Add:

**auth-lambda:**
```
ADMIN_PASSWORD_HASH=<generated_bcrypt_hash>
```

**upload-to-s3-lambda:**
```
(No new env vars needed - existing S3 config remains)
```

---

### 4. Testing After Deployment

#### Test Authentication:
1. Visit: `https://your-domain.com/admin`
2. Should see login form
3. Enter password
4. Should login successfully

#### Test Upload:
1. Login to admin
2. Upload a test image with tags
3. Verify image appears in gallery
4. Check tags don't have double ##

#### Test Carousel:
1. Visit homepage
2. Check carousel shows full-width images on mobile
3. Click an image - should open modal
4. Verify tags not shown in carousel (only in modal)

---

## 📝 Important Notes

### Security:
- ⚠️ **Never commit `.env` file** - it's in `.gitignore`
- ⚠️ **Use strong password** - not `admin123` in production
- ⚠️ **Store password hash securely** in Lambda environment variables

### Frontend Environment:
The frontend `.env.local` currently points to `localhost`. For production:
```
REACT_APP_API_BASE_URL=https://your-api-gateway-url.amazonaws.com
```

This is already configured in the GitHub Actions workflow via secrets.

---

## 🔄 Deployment Order

1. ✅ **Frontend** - Automatic (GitHub Actions triggered)
2. ⚠️ **Backend Lambda** - Manual deployment needed:
   - Create `auth-lambda`
   - Update `upload-to-s3-lambda`
   - Update API Gateway routes
3. ✅ **Test** - Verify all functionality

---

## 📞 Support

If you encounter issues:
1. Check CloudWatch Logs for Lambda errors
2. Verify API Gateway routes are configured correctly
3. Confirm CORS headers are set properly
4. Test authentication endpoint directly with curl

---

**Deployment Status:** Ready to deploy! 🚀

Frontend will deploy automatically.
Backend Lambda functions need manual deployment.
