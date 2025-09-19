# ACW Frontend (React)

This is a Create React App (CRA) frontend for Alka's Cake Walk. In production it is served from Amazon S3 (optionally behind CloudFront). It consumes a serverless backend hosted on API Gateway + Lambda.

Key backend endpoints the UI uses:
- `GET /api/cakes` — Lists images from S3 with pre-signed URLs and metadata
- `POST /api/upload` — Uploads a new image with metadata to S3 via multipart/form-data

See: `frontend/src/services/s3Service.js`

## Local Development

Prerequisites:
- Node.js 18+
- Backend local server running (optional) on `http://localhost:3001` or adjust proxy

Install and run:
```bash
npm install
npm start
```
The app runs at http://localhost:3000 and proxies API requests to http://localhost:3001 via `frontend/src/setupProxy.js`.

## Environment Configuration

The frontend needs a base URL for the API in production builds. Use the env var `REACT_APP_API_BASE`.

- Development (via proxy): no env var needed; calls `/api/*` are proxied.
- Production (S3/CloudFront): set the API Gateway base URL, e.g.

```bash
REACT_APP_API_BASE=https://abc123.execute-api.ap-south-1.amazonaws.com npm run build
```

Notes:
- `s3Service.js` should read `process.env.REACT_APP_API_BASE` and default to `/api` for local dev.
- If you configure CloudFront to route `/api/*` to API Gateway, you can omit `REACT_APP_API_BASE` and keep relative `/api` paths in production.

## Build

```bash
npm run build
```
Artifacts are generated under `frontend/build/`.

## Deploy to S3 (Static Website Hosting)

Option A — S3 Website (simple, HTTP only):
1. Create an S3 bucket (e.g., `acw-website-frontend`) in your chosen region.
2. Enable Static website hosting. Set Index document: `index.html`; Error document: `index.html` (for SPA).
3. Make the bucket objects publicly readable (bucket policy) or prefer CloudFront (recommended) to avoid public bucket policies.
4. Upload `build/` contents.

Option B — CloudFront (HTTPS, recommended):
1. Keep the S3 bucket private.
2. Create a CloudFront distribution with the S3 bucket as origin using Origin Access Control (OAC).
3. Default root object: `index.html`.
4. Custom error responses for SPA: map 403/404 to `/index.html` with HTTP 200.
5. (Optional) Route 53 + ACM to use a custom domain and HTTPS.

## CI/CD from GitHub (S3 + CloudFront)

You can automate deployments on push to `main`.

Example GitHub Actions workflow (excerpt):
```yaml
name: Deploy Frontend
on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'
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
      - name: Build
        working-directory: frontend
        env:
          REACT_APP_API_BASE: ${{ secrets.REACT_APP_API_BASE }}
        run: |
          npm ci
          npm run build
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-south-1
      - name: Sync to S3
        run: |
          aws s3 sync frontend/build s3://acw-website-frontend --delete
      - name: Invalidate CloudFront (optional)
        if: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID != '' }}
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths '/*'
```

Secrets to set in the repo:
- `AWS_ROLE_ARN` — An IAM Role ARN trusted by GitHub OIDC
- `REACT_APP_API_BASE` — Your API base URL (if not using CloudFront path routing)
- `CLOUDFRONT_DISTRIBUTION_ID` — Optional, for cache invalidation

## Troubleshooting

- Mixed content or CORS issues: ensure API Gateway CORS allows your exact site origin; use HTTPS everywhere with CloudFront.
- SPA routing returns 403/404: ensure S3/CloudFront error mapping serves `/index.html` with 200.
- Stale assets: create a CloudFront invalidation after deploy.
