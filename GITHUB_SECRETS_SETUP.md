# GitHub Secrets Configuration Guide

This guide shows you how to configure GitHub Secrets for automated Lambda deployment.

## Required GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

### 1. AWS Configuration

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ROLE_ARN` | IAM role ARN for GitHub OIDC | `arn:aws:iam::123456789012:role/GitHubActionsRole` |
| `MY_AWS_REGION` | AWS region | `ap-south-1` |

### 2. Lambda Function Names

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `GET_CAKES_FUNCTION_NAME` | Existing get-cakes Lambda | `acw-get-cakes-lambda` |
| `UPLOAD_FUNCTION_NAME` | Existing upload Lambda | `acw-upload-lambda` |
| `AUTH_FUNCTION_NAME` | **NEW** Auth Lambda | `acw-auth-lambda` |

### 3. IAM Role ARNs (for Lambda execution)

**Note:** The workflow will automatically use your existing `AWS_ROLE_ARN` or `GET_CAKES_ROLE_ARN` for Lambda execution. You don't need to add separate role ARNs unless you want different roles for each Lambda.

**Optional:** If you want a specific Lambda execution role different from `AWS_ROLE_ARN`:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `LAMBDA_EXECUTION_ROLE_ARN` | Optional: Specific role for Lambda execution | `arn:aws:iam::123456789012:role/lambda-execution-role` |

### 4. Application Configuration

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `S3_BUCKET_NAME` | S3 bucket for cake images | `cakewalkbucket2` |
| `ADMIN_PASSWORD_HASH` | **NEW** Bcrypt password hash | `$2b$10$WmEUgRKfbeadii5vwWU2getFPswmr6fDSVnyu8v6DBO8KJ4WlKiX6` |

### 5. Frontend Configuration

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `FRONTEND_S3_BUCKET_NAME` | S3 bucket for frontend hosting | `acw-frontend-123456` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID | `E1234567890ABC` |
| `REACT_APP_API_BASE_URL` | API Gateway URL | `https://abc123.execute-api.ap-south-1.amazonaws.com` |

---

## Step-by-Step Setup

### Step 1: Find Your Existing Values

Most secrets are already configured. You only need to add **2 new secrets**:

1. **AUTH_FUNCTION_NAME**: Choose a name like `acw-auth-lambda`
2. **ADMIN_PASSWORD_HASH**: Already generated: `$2b$10$WmEUgRKfbeadii5vwWU2getFPswmr6fDSVnyu8v6DBO8KJ4WlKiX6`

**Note:** The workflow will automatically reuse your existing `AWS_ROLE_ARN` for Lambda execution, so you don't need to add a separate role ARN!

### Step 2: Add New Secrets to GitHub

1. Go to: https://github.com/kuldipkumar/acw/settings/secrets/actions
2. Click **"New repository secret"**
3. Add these two new secrets:

   **Secret 1:**
   - Name: `AUTH_FUNCTION_NAME`
   - Value: `acw-auth-lambda`

   **Secret 2:**
   - Name: `ADMIN_PASSWORD_HASH`
   - Value: `$2b$10$WmEUgRKfbeadii5vwWU2getFPswmr6fDSVnyu8v6DBO8KJ4WlKiX6`

### Step 3: Verify All Secrets

Check that you have all these secrets configured:

**Already Configured:**
- ✅ AWS_ROLE_ARN (used for both GitHub OIDC and Lambda execution)
- ✅ MY_AWS_REGION
- ✅ GET_CAKES_FUNCTION_NAME
- ✅ UPLOAD_FUNCTION_NAME
- ✅ S3_BUCKET_NAME
- ✅ FRONTEND_S3_BUCKET_NAME
- ✅ CLOUDFRONT_DISTRIBUTION_ID
- ✅ REACT_APP_API_BASE_URL

**Newly Added:**
- ✅ **AUTH_FUNCTION_NAME** (NEW)
- ✅ **ADMIN_PASSWORD_HASH** (NEW)

---

## How to Find Your Values

### Find Lambda Function Names
```bash
aws lambda list-functions --query 'Functions[*].FunctionName' --output table
```

### Find IAM Role ARN
```bash
# From existing Lambda
aws lambda get-function --function-name <your-lambda-name> --query 'Configuration.Role' --output text
```

### Find S3 Bucket Name
```bash
aws s3 ls | grep cakewalk
```

### Find API Gateway URL
```bash
aws apigatewayv2 get-apis --query 'Items[*].[Name,ApiEndpoint]' --output table
```

Or check your current frontend environment:
```bash
cat frontend/.env.local | grep REACT_APP_API_BASE_URL
```

---

## Testing the Setup

After adding secrets, test the deployment:

1. **Make a small change to backend code:**
   ```bash
   # Add a comment to trigger deployment
   echo "// Test deployment" >> backend/auth-lambda.js
   git add backend/auth-lambda.js
   git commit -m "test: trigger backend deployment"
   git push origin main
   ```

2. **Watch GitHub Actions:**
   - Go to: https://github.com/kuldipkumar/acw/actions
   - Click on the running workflow
   - Monitor the deployment progress

3. **Verify Lambda was created:**
   - Go to AWS Lambda Console
   - Look for `acw-auth-lambda` function
   - Check environment variables include `ADMIN_PASSWORD_HASH`

---

## Troubleshooting

### "Secret not found" error
- Double-check secret names match exactly (case-sensitive)
- Verify you added secrets to the correct repository

### "Access Denied" error
- Check `AWS_ROLE_ARN` has permissions for Lambda operations
- Verify OIDC trust relationship is configured

### Lambda not created
- Check `AWS_ROLE_ARN` exists and has Lambda execution permissions
- Verify the role has permissions to create Lambda functions
- Check CloudWatch Logs for detailed error messages

### Password hash not working
- Ensure no extra spaces or quotes in the secret value
- Copy the exact hash from `MANUAL_DEPLOY.md`

---

## Next Steps After Secrets Are Configured

1. ✅ Push code to trigger deployment
2. ⚠️ **Configure API Gateway routes** (one-time manual step)
3. ✅ Test login on production site

---

## Password Information

**Current Password:** `Alka@1612!`

**Current Hash:** `$2b$10$WmEUgRKfbeadii5vwWU2getFPswmr6fDSVnyu8v6DBO8KJ4WlKiX6`

To generate a new password hash:
```bash
cd backend
node generate-password-hash.js "YourNewPassword"
```

Then update the `ADMIN_PASSWORD_HASH` secret in GitHub.
