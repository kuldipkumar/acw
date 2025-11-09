# Alka's Cake Walk — High-Level Architecture

This document describes the target serverless architecture for running the website on AWS within the Free Tier, and how code flows from GitHub to AWS for both frontend and backend.

## Overview

- Frontend: React app hosted on Amazon S3 (optionally behind CloudFront for HTTPS/caching). 
- Backend: API Gateway (HTTP API) + AWS Lambda functions. 
- Storage: Private S3 bucket for images. Lambdas generate pre‑signed URLs for secure access.
- CI/CD: GitHub Actions deploying to AWS via OpenID Connect (OIDC) and an IAM Role. 

## Diagram

```mermaid
flowchart LR
  subgraph User[Browser]
    U[User]
  end

  subgraph CDN[CloudFront (optional)]
    CF[Distribution]
  end

  subgraph FE[S3 Frontend Bucket]
    S3Site[(Static Website Files)]
  end

  subgraph API[API Gateway (HTTP API)]
    APIG[/ /api/* /]
  end

  subgraph Lambdas[AWS Lambda]
    L1[get-cakes]
    L2[upload-to-s3]
  end

  subgraph Images[S3 Images Bucket]
    S3Img[(Private Objects + Metadata)]
  end

  U -->|HTTPS| CF
  CF -->|GET / (static)| S3Site
  U -->|HTTPS /api/*| CF
  CF -->|Origin routing /api/*| APIG

  APIG --> L1
  APIG --> L2
  L1 -->|List/Head/Get| S3Img
  L2 -->|PutObject| S3Img

  subgraph GitHub[GitHub Actions]
    GH[Workflows]
  end

  GH -->|OIDC AssumeRole| AWS[(AWS Account)]
  GH -->|Deploy Frontend| S3Site
  GH -->|Deploy API| L1
  GH -->|Deploy API| L2
```

Notes:
- If CloudFront is omitted, the browser hits the S3 Website endpoint directly for static assets and the API Gateway URL directly for `/api/*`.
- With CloudFront, you can route `/api/*` to API Gateway and `/*` to the S3 website, enabling a single HTTPS domain.

## Components

- Frontend (`frontend/`)
  - Built with Create React App.
  - Calls backend using `REACT_APP_API_BASE` or relative `/api` when CloudFront path routing is used.
  - Deployed to an S3 bucket (public via CloudFront using Origin Access Control).

- Backend (`backend/`)
  - `get-cakes-lambda`: Lists objects from the images bucket, reads metadata, returns pre‑signed URLs.
  - `upload-to-s3-lambda`: Parses `multipart/form-data`, validates file, writes to S3 with metadata.
  - Local dev proxy available via `local-server.js`.

- Storage (S3 Images Bucket)
  - Private bucket (e.g., `cakewalkbucket2` in `ap-south-1`).
  - Accessed only by Lambda via IAM policies.

- Networking
  - API Gateway HTTP API with routes:
    - `GET /api/cakes` → `get-cakes` Lambda
    - `POST /api/upload` → `upload-to-s3` Lambda
  - CORS configured to allow the site origin.
  - Binary media types include `multipart/form-data` to support uploads.

## GitHub → AWS Deployment

### Authentication (OIDC)

Use GitHub OIDC to assume an IAM Role in your AWS account without long‑lived secrets:

1. Create an IAM Role with a trust policy for GitHub OIDC, limiting to your repo and branch, e.g. `repo:youruser/yourrepo:ref:refs/heads/main`.
2. Attach policies:
   - Frontend deploy: `s3:PutObject` / `s3:DeleteObject` on the frontend bucket, and optional `cloudfront:CreateInvalidation`.
   - Backend deploy: `lambda:UpdateFunctionCode`, and if using IaC, permissions for CloudFormation/SAM to create/update API Gateway, Lambda, IAM.
3. Save the Role ARN in repo secrets as `AWS_ROLE_ARN`.

### Frontend Workflow (S3 + optional CloudFront)

- Trigger: push to `main` affecting `frontend/**`.
- Steps:
  - Build React app with `REACT_APP_API_BASE` pointing to API Gateway (if not using CloudFront path routing).
  - `aws s3 sync frontend/build s3://<frontend-bucket> --delete`
  - Optionally invalidate CloudFront distribution.

See `frontend/README-ACW.md` for a ready‑to‑use Actions snippet and required secrets.

### Backend Workflow (Lambda + API Gateway)

Two options:
- Code‑only updates: zip handler + node_modules and call `aws lambda update-function-code`.
- Infrastructure as Code (recommended): use AWS SAM to define Lambdas, API Gateway, and permissions.

Minimal code‑only example included in `backend/README.md`.

SAM outline:
- Template defines:
  - `AWS::Serverless::Function` for each Lambda.
  - `AWS::Serverless::HttpApi` for API with `/api/cakes` and `/api/upload` routes.
  - Outputs the API base URL for use in the frontend build.
- Actions job runs `sam build` + `sam deploy --no-confirm-changeset --capabilities CAPABILITY_IAM`.

## Free‑Tier and Cost Safety

- S3: 5 GB storage, 20k GET, 2k PUT per month (first 12 months).
- Lambda: 1M requests + 400k GB‑seconds per month.
- API Gateway (HTTP API): 1M requests per month (first 12 months).
- CloudFront: Free tier covers low traffic; prefer CloudFront for HTTPS.
- Create a Cost Budget with email alerts at $1.

## Production Configuration Checklist

- Frontend
  - `REACT_APP_API_BASE` set to API Gateway base URL OR CloudFront routes `/api/*` to API Gateway.
  - SPA routing configured: 403/404 → `/index.html` with HTTP 200 in CloudFront.

- Backend
  - API Gateway CORS allows exact site origin and methods `GET,POST,OPTIONS`.
  - Binary media types include `multipart/form-data`.
  - Lambda roles allow the necessary S3 actions.

- S3 Images
  - Bucket is private. Access via Lambda only.
  - Optional CORS for GET if fetching via XHR (not required for `<img>` with pre‑signed URLs).

## Local Development

- Run backend: `node backend/local-server.js` (port 3001).
- Run frontend: `npm start` in `frontend/` (port 3000). Dev proxy forwards `/api/*` to `3001`.

## Next Steps

- Switch `frontend/src/services/s3Service.js` to read `REACT_APP_API_BASE` and fallback to `/api`.
- Ensure `get-cakes-lambda.js` uses a module format compatible with Lambda (CommonJS or `.mjs`).
- Optionally add a SAM template for one‑command deploys (API + Lambdas).
