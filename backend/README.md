# ACW Backend (Serverless API)

This backend is designed to run fully on AWS using API Gateway + Lambda and S3. It exposes two main APIs used by the frontend.

- GET `/api/cakes` — Lists images in S3 and returns pre-signed URLs and metadata.
- POST `/api/upload` — Accepts a multipart/form-data upload and stores the file + metadata in S3.

The same logic is available in two forms:
- `local-server.js` — Express server to run locally for development.
- `get-cakes-lambda.js` and `upload-to-s3-lambda.js` — Lambda handlers for production in AWS.

## Project Structure

- `local-server.js` — Local dev server exposing `/api/cakes`, `/api/upload`, `/api/reviews`, and `/health`.
- `get-cakes-lambda.js` — Lambda handler that lists S3 objects and returns pre-signed URLs.
- `upload-to-s3-lambda.js` — Lambda handler that parses `multipart/form-data` and uploads to S3.
- `.env.example` — Sample environment configuration for local dev.
- `uploads/` — Local temporary upload directory for `multer` in dev.

## Prerequisites

- Node.js 18+
- AWS account with programmatic credentials
- An S3 bucket for images (default hardcoded: `cakewalkbucket2` in region `ap-south-1`)

## Environment Variables

Create `backend/.env` for local development (do NOT commit to git):

```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET_NAME=cakewalkbucket2
PORT=3001
NODE_ENV=development

# Optional Google Places
GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_ID=...
```

Notes:
- Production Lambdas use IAM roles for S3. You generally do not set static access keys on Lambda.
- Code now reads bucket/region from environment variables: `S3_BUCKET_NAME` and `AWS_REGION`.

## Local Development

1) Install dependencies
```
npm install
```

2) Run the local API
```
node local-server.js
```
This starts the API on `http://localhost:3001` with routes:
- `POST /api/upload`
- `GET /api/cakes`
- `GET /api/reviews` (mocked if Google API not configured)
- `GET /health`

## AWS Deployment (API Gateway + Lambda)

You will create two Lambda functions and an HTTP API in API Gateway.

### 1) Package and deploy `get-cakes-lambda`

- Ensure the module format is supported by Lambda Node.js 18. Options:
  - Convert to CommonJS exports (recommended for simplicity), or
  - Rename to `.mjs` and keep ESM, and set handler accordingly.
- Create a folder, copy the handler as `index.js` (or `index.mjs`), and install deps:
```
npm init -y
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
zip -r get-cakes.zip .
```
- In AWS Console, create a Lambda function (Node.js 18.x, `ap-south-1`), upload `get-cakes.zip`, and set handler `index.handler`.
- Attach an execution role policy allowing:
  - `s3:ListBucket` on `arn:aws:s3:::cakewalkbucket2`
  - `s3:GetObject`, `s3:HeadObject` on `arn:aws:s3:::cakewalkbucket2/*`

#### Production Configuration (Environment Variables)
- Set the following on the Lambda function configuration:
  - `AWS_REGION=ap-south-1` (or your region)
  - `S3_BUCKET_NAME=cakewalkbucket2` (or your bucket)

### 2) Package and deploy `upload-to-s3-lambda`

- Create a folder, copy handler as `index.js`.
- Install deps:
```
npm init -y
npm install aws-sdk uuid
zip -r upload.zip .
```
- Create a Lambda function (Node.js 18.x), upload `upload.zip`, set handler `index.handler`.
- Environment:
  - `AWS_REGION=ap-south-1`
  - `S3_BUCKET_NAME=cakewalkbucket2`
- Execution role policy allowing:
  - `s3:PutObject` on `arn:aws:s3:::cakewalkbucket2/*`
  - `s3:ListBucket`, `s3:HeadObject`, `s3:GetObject` as needed.

### 3) API Gateway (HTTP API)

- Create an HTTP API.
- Add routes:
  - `GET /api/cakes` -> Lambda integration (get-cakes function)
  - `POST /api/upload` -> Lambda integration (upload function)
- CORS:
  - Allow origin: your site origin (S3 website or CloudFront domain).
  - Allow methods: `GET,POST,OPTIONS`
  - Allow headers: `Content-Type, Authorization, x-amz-date, x-amz-security-token`
- Binary media:
  - Enable `multipart/form-data` (or `*/*`) so uploads are passed base64-encoded.

### 4) Test

- Curl or use the frontend to hit `/api/cakes` and `/api/upload`.

## CI/CD from GitHub

You can automate Lambda deployments using GitHub Actions. Two common approaches:

- Update code-only (zip and update function code):
```yaml
name: Deploy Lambdas
on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Package get-cakes
        working-directory: backend/lambdas/get-cakes
        run: |
          npm ci || npm install
          zip -r ../../dist/get-cakes.zip .
      - name: Package upload
        working-directory: backend/lambdas/upload
        run: |
          npm ci || npm install
          zip -r ../../dist/upload.zip .
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-south-1
      - name: Update Lambda code
        run: |
          aws lambda update-function-code --function-name get-cakes --zip-file fileb://backend/dist/get-cakes.zip
          aws lambda update-function-code --function-name upload-to-s3 --zip-file fileb://backend/dist/upload.zip
```
- Infrastructure as Code (SAM/Terraform): recommended for creating/updating API Gateway + Lambdas + IAM in one workflow.

## Troubleshooting

- CORS errors: verify API Gateway CORS is enabled for your exact site origin; ensure Lambda responses include `Access-Control-Allow-Origin`.
- Uploads failing: ensure API Gateway passes binary bodies, and do not set `Content-Type` manually when using `FormData` on the frontend.
- S3 AccessDenied: check Lambda role policies and bucket name/region.
# Triggering a fresh workflow run
