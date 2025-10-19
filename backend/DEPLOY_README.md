# Lambda Deployment Guide

## Quick Start

Deploy your Lambda functions with one command:

```bash
cd backend
./deploy-lambdas.sh
```

## Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws configure
   ```
   
   You'll need:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `ap-south-1`

2. **Password hash in .env file**
   
   Your `backend/.env` should have:
   ```
   ADMIN_PASSWORD_HASH=$2b$10$...
   ```
   
   If not, generate it:
   ```bash
   node generate-password-hash.js "YourPassword"
   ```
   Then add the output to `.env`

## What the Script Does

The deployment script automatically:

1. ✅ Packages Lambda functions with dependencies
2. ✅ Creates `acw-auth-lambda` (if doesn't exist)
3. ✅ Updates `acw-upload-lambda` (if exists)
4. ✅ Sets environment variables (password hash)
5. ✅ Creates IAM role if needed
6. ✅ Cleans up temporary files

## After Deployment

### Configure API Gateway

You still need to manually configure API Gateway routes:

1. Go to AWS API Gateway Console
2. Select your API
3. Create/update routes:

   **Auth Route:**
   - Method: `POST`
   - Path: `/api/auth/login`
   - Integration: Lambda → `acw-auth-lambda`
   - CORS: Enabled

   **Upload Route:**
   - Method: `POST`
   - Path: `/api/upload`
   - Integration: Lambda → `acw-upload-lambda`
   - CORS: Enabled with `Authorization` header

4. Deploy API to stage

### Test Deployment

```bash
# Test auth endpoint
curl -X POST https://your-api-url/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"password":"YourPassword"}'

# Expected response:
# {"success":true,"message":"Login successful","token":"..."}
```

## Troubleshooting

### "AWS CLI not found"
Install AWS CLI: https://aws.amazon.com/cli/

### "ADMIN_PASSWORD_HASH not found"
Run: `node generate-password-hash.js YourPassword`
Add output to `backend/.env`

### "Access Denied"
Check your AWS credentials:
```bash
aws sts get-caller-identity
```

### "Function already exists"
The script will update existing functions automatically.

### "IAM role propagation"
If you get role errors, wait 30 seconds and run again.

## Manual Deployment (Alternative)

If the script doesn't work, you can deploy manually:

### 1. Package Functions

```bash
cd backend
mkdir -p .deploy/auth-lambda
cp auth-lambda.js .deploy/auth-lambda/index.js
cd .deploy/auth-lambda
npm install bcryptjs --production
zip -r ../auth-lambda.zip .
```

### 2. Upload to AWS

```bash
aws lambda create-function \
  --function-name acw-auth-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://auth-lambda.zip \
  --environment Variables={ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH}
```

## Configuration

### Lambda Function Names

Default names (change in script if needed):
- Auth: `acw-auth-lambda`
- Upload: `acw-upload-lambda`

### IAM Role

The script creates: `acw-lambda-execution-role` with:
- Basic Lambda execution permissions
- S3 full access (for upload function)

### Environment Variables

Set in Lambda:
- `ADMIN_PASSWORD_HASH` - Your bcrypt password hash

## Security Notes

⚠️ **Important:**
- Never commit `.env` file
- Use strong passwords
- Rotate password hashes regularly
- Review IAM permissions

## Support

If you encounter issues:
1. Check CloudWatch Logs
2. Verify AWS credentials
3. Confirm region is correct
4. Check IAM permissions

---

**Ready to deploy?** Run `./deploy-lambdas.sh` 🚀
