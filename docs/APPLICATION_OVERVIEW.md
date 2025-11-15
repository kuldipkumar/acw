# Alka's Cake Walk (ACW) - Complete Application Overview

> **Quick Reference Document**: This document provides a comprehensive overview of the application's architecture, modules, features, and codebase structure. Use this as your primary reference to understand the system without scanning the entire codebase.

**Last Updated**: November 2024  
**Version**: 1.0  
**Tech Stack**: React (Frontend) + AWS Lambda/API Gateway (Backend) + S3 (Storage)

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Modules & Features](#core-modules--features)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Backend Lambda Functions](#backend-lambda-functions)
8. [Deployment Architecture](#deployment-architecture)
9. [Environment Configuration](#environment-configuration)
10. [Key Files Reference](#key-files-reference)

---

## System Architecture

### High-Level Overview
```
┌─────────────┐
│   Browser   │
│   (User)    │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────────┐
│   CloudFront    │ (Optional CDN)
│  Distribution   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌──────────────┐
│   S3   │  │ API Gateway  │
│Frontend│  │  (HTTP API)  │
│ Bucket │  └──────┬───────┘
└────────┘         │
                   │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │get-cakes│ │upload │ │  auth  │
    │ Lambda │ │Lambda │ │Lambda │
    └────┬───┘ └───┬────┘ └────────┘
         │         │
         └────┬────┘
              │
              ▼
        ┌──────────┐
        │    S3    │
        │  Images  │
        │  Bucket  │
        └──────────┘
```

### Architecture Principles
- **Serverless**: No servers to manage, fully AWS Lambda-based backend
- **Scalable**: Auto-scales with traffic, stays within AWS Free Tier
- **Secure**: Private S3 buckets, pre-signed URLs, authentication for admin operations
- **Cost-Effective**: Designed to run within AWS Free Tier limits

---

## Technology Stack

### Frontend
- **Framework**: React 19.1.1 (Create React App)
- **Routing**: React Router DOM 7.8.2
- **UI Components**: 
  - React Slick (carousel)
  - Custom CSS with theme support (light/dark mode)
- **State Management**: React Hooks (useState, useEffect)
- **Build Tool**: React Scripts 5.0.1

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express 5.1.0 (local dev only)
- **AWS Services**:
  - Lambda (compute)
  - API Gateway HTTP API (routing)
  - S3 (storage)
- **Key Libraries**:
  - `@aws-sdk/client-s3` (v3 SDK)
  - `bcryptjs` (password hashing)
  - `multer` (file uploads - local dev)
  - `busboy` (multipart parsing - Lambda)
  - `uuid` (unique IDs)

### Infrastructure
- **Hosting**: AWS S3 + CloudFront
- **CI/CD**: GitHub Actions with OIDC
- **Domain**: Porkbun DNS (optional custom domain)
- **Region**: ap-south-1 (Mumbai)

---

## Project Structure

```
acw-website/
├── frontend/                    # React application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── common/         # Shared components (Header, Footer, etc.)
│   │   │   └── home/           # Home page components
│   │   ├── pages/              # Page components
│   │   │   ├── HomePage.js
│   │   │   ├── GalleryPage.js
│   │   │   ├── MenuPage.js
│   │   │   ├── ContactPage.js
│   │   │   └── AdminPage.js
│   │   ├── services/           # API service layer
│   │   │   └── s3Service.js
│   │   ├── App.js              # Main app component
│   │   ├── config.js           # Frontend configuration
│   │   └── setupProxy.js       # Dev proxy configuration
│   ├── package.json
│   └── README-ACW.md
│
├── backend/                     # Serverless backend
│   ├── local-server.js         # Express server for local dev
│   ├── get-cakes-lambda.js     # Lambda: List images with metadata
│   ├── upload-to-s3-lambda.js  # Lambda: Upload images
│   ├── auth-lambda.js          # Lambda: Admin authentication
│   ├── update-metadata-lambda.js # Lambda: Update image metadata
│   ├── deploy-lambdas.sh       # Deployment script
│   ├── package.json
│   └── .env.example            # Environment template
│
├── infrastructure/              # Infrastructure scripts
│   ├── create-frontend-infrastructure.sh
│   ├── configure-custom-domain.sh
│   └── update-cors-for-domain.sh
│
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml  # Frontend CI/CD
│       └── deploy-backend.yml   # Backend CI/CD
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # Deployment architecture
│   ├── APPLICATION_OVERVIEW.md  # This file
│   ├── LAMBDA_DOCUMENTATION.md  # Lambda details
│   ├── DEPLOYMENT_SUMMARY.md    # Deployment guide
│   └── [other docs]
│
└── run-local.sh                 # Local development startup script
```

---

## Core Modules & Features

### 1. **Image Gallery System**
- **Purpose**: Display cake images with metadata
- **Features**:
  - Grid/masonry layout
  - Image modal with full-screen view
  - Category filtering
  - Tag-based organization
  - Lazy loading
  - Responsive design

### 2. **Admin Panel**
- **Purpose**: Manage cake images and metadata
- **Features**:
  - Password-protected access
  - Image upload with metadata
  - Edit existing image metadata
  - Set landing page hero image
  - Real-time preview
- **Authentication**: bcrypt password hashing + Bearer token

### 3. **Landing Page**
- **Purpose**: Showcase business and attract customers
- **Features**:
  - Hero section with dynamic image
  - Cake carousel
  - Customer testimonials (Google Reviews integration)
  - Call-to-action sections
  - Theme switcher (light/dark mode)

### 4. **Menu Page**
- **Purpose**: Display cake categories and offerings
- **Features**:
  - Category cards
  - Pricing information
  - Custom order CTA

### 5. **Contact Page**
- **Purpose**: Business contact information
- **Features**:
  - Contact details
  - Location information
  - Social media links

### 6. **Theme System**
- **Purpose**: User preference for light/dark mode
- **Features**:
  - Persistent theme selection (localStorage)
  - Smooth transitions
  - System preference detection

---

## API Endpoints

### Base URL
- **Local Dev**: `http://localhost:3001/api`
- **Production**: `https://[api-gateway-id].execute-api.ap-south-1.amazonaws.com/api`

### Endpoints

#### 1. **GET /api/cakes**
- **Purpose**: List all cake images with metadata
- **Auth**: None (public)
- **Response**:
```json
[
  {
    "id": "uuid.jpg",
    "name": "Chocolate Delight",
    "description": "Rich chocolate cake",
    "category": "chocolate",
    "tags": ["birthday", "premium"],
    "originalname": "chocolate-cake.jpg",
    "alt": "Image of Chocolate Delight",
    "src": "https://presigned-url...",
    "url": "https://presigned-url...",
    "lastModified": "2024-11-15T...",
    "size": 1024000,
    "isLandingImage": false
  }
]
```

#### 2. **POST /api/upload**
- **Purpose**: Upload new cake image with metadata
- **Auth**: Required (Bearer token)
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `image`: File (required)
  - `title`: String
  - `description`: String
  - `category`: String
  - `tags`: String (comma-separated)
- **Response**:
```json
{
  "success": true,
  "message": "File uploaded successfully!",
  "location": "https://s3-url..."
}
```

#### 3. **PUT /api/cakes/:id**
- **Purpose**: Update image metadata
- **Auth**: Required (Bearer token)
- **Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "chocolate",
  "tags": ["tag1", "tag2"],
  "isLandingImage": true
}
```

#### 4. **POST /api/auth/login**
- **Purpose**: Admin authentication
- **Auth**: None
- **Body**:
```json
{
  "password": "admin-password"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "base64-encoded-token"
}
```

#### 5. **GET /api/reviews**
- **Purpose**: Fetch Google Reviews
- **Auth**: None (public)
- **Response**:
```json
{
  "source": "google",
  "total": 50,
  "rating": 4.8,
  "reviews": [...]
}
```

#### 6. **GET /health**
- **Purpose**: Health check endpoint
- **Auth**: None
- **Response**:
```json
{
  "ok": true,
  "bucket": "cakewalkbucket2",
  "region": "ap-south-1",
  "awsCreds": {
    "accessKeySet": true,
    "secretSet": true
  }
}
```

---

## Frontend Components

### Page Components (`src/pages/`)

#### HomePage.js
- Main landing page
- Imports: HeroSection, CakeCarousel, Testimonials

#### GalleryPage.js
- Image gallery with filtering
- Modal view for images
- Category and tag filters

#### AdminPage.js
- Admin dashboard
- Login form
- Image upload form
- Image management grid
- Edit metadata modal

#### MenuPage.js
- Cake categories display
- Pricing information

#### ContactPage.js
- Business contact details
- Location and hours

### Common Components (`src/components/common/`)

#### Header.js
- Navigation bar
- Responsive menu
- Active route highlighting

#### Footer.js
- Footer information
- Social links
- Copyright

#### ThemeSwitcher.js
- Light/dark mode toggle
- Persistent preference

### Home Components (`src/components/home/`)

#### HeroSection.js
- Dynamic hero image from S3
- Call-to-action buttons
- Overlay text

#### CakeCarousel.js
- React Slick carousel
- Featured cakes display
- Auto-play with custom arrows

#### Testimonials.js
- Google Reviews integration
- Star ratings
- Customer feedback display

### Auth Components (`src/components/auth/`)

#### LoginForm.js
- Password input
- Authentication handling
- Token storage

### Utility Components

#### ImageModal.js
- Full-screen image viewer
- Navigation controls
- Close button

#### EditImageModal.js
- Metadata editing form
- Landing image toggle
- Save/cancel actions

---

## Backend Lambda Functions

### 1. **get-cakes-lambda.js**
- **Purpose**: List all images from S3 with metadata
- **Trigger**: API Gateway GET /api/cakes
- **Dependencies**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- **Process**:
  1. List objects in S3 bucket
  2. For each object, fetch metadata via HeadObject
  3. Generate pre-signed URL (1-hour expiry)
  4. Return formatted array
- **Environment Variables**:
  - `S3_BUCKET_NAME`
  - `AWS_REGION`

### 2. **upload-to-s3-lambda.js**
- **Purpose**: Handle multipart file uploads
- **Trigger**: API Gateway POST /api/upload
- **Dependencies**: `aws-sdk`, `busboy`, `uuid`
- **Process**:
  1. Parse multipart/form-data using busboy
  2. Validate file type and size
  3. Generate unique filename with UUID
  4. Upload to S3 with metadata
  5. Return success response
- **Environment Variables**:
  - `S3_BUCKET_NAME`
  - `AWS_REGION`

### 3. **auth-lambda.js**
- **Purpose**: Admin authentication
- **Trigger**: API Gateway POST /api/auth/login
- **Dependencies**: `bcryptjs`
- **Process**:
  1. Parse password from request
  2. Compare with hashed password
  3. Generate token on success
  4. Return token or error
- **Environment Variables**:
  - `ADMIN_PASSWORD_HASH`

### 4. **update-metadata-lambda.js**
- **Purpose**: Update image metadata in S3
- **Trigger**: API Gateway PUT /api/cakes/:id
- **Dependencies**: `@aws-sdk/client-s3`
- **Process**:
  1. Fetch existing metadata
  2. If setting as landing image, unset others
  3. Copy object with updated metadata
  4. Return success response
- **Environment Variables**:
  - `S3_BUCKET_NAME`
  - `AWS_REGION`

### 5. **local-server.js** (Development Only)
- **Purpose**: Local Express server mimicking Lambda behavior
- **Features**:
  - All API endpoints
  - CORS enabled
  - File upload with multer
  - Mock data fallback
  - Health check endpoint

---

## Deployment Architecture

### Frontend Deployment (S3 + CloudFront)

**Flow**: GitHub → Actions → S3 → CloudFront

1. **Build**: React app compiled to static files
2. **Upload**: `aws s3 sync` to S3 bucket
3. **Invalidate**: CloudFront cache cleared
4. **Access**: Via CloudFront distribution URL or custom domain

**GitHub Actions Workflow**: `.github/workflows/deploy-frontend.yml`

### Backend Deployment (Lambda + API Gateway)

**Flow**: GitHub → Actions → Lambda Functions → API Gateway

1. **Package**: Zip Lambda code + node_modules
2. **Deploy**: `aws lambda update-function-code`
3. **Configure**: Environment variables set
4. **Route**: API Gateway routes to Lambda functions

**GitHub Actions Workflow**: `.github/workflows/deploy-backend.yml`

### Authentication (GitHub OIDC)
- No long-lived AWS credentials
- IAM Role with trust policy for GitHub
- Temporary credentials per workflow run

---

## Environment Configuration

### Frontend Environment Variables

```bash
# Production API base URL (optional if using CloudFront routing)
REACT_APP_API_BASE_URL=https://[api-id].execute-api.ap-south-1.amazonaws.com/api
```

### Backend Environment Variables

#### Local Development (`.env`)
```bash
# AWS Credentials (local only)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1

# S3 Configuration
S3_BUCKET_NAME=cakewalkbucket2

# Server Configuration
PORT=3001
NODE_ENV=development

# Admin Authentication
ADMIN_PASSWORD_HASH=$2a$10$...

# Google Reviews (optional)
GOOGLE_PLACES_API_KEY=your-api-key
GOOGLE_PLACE_ID=ChIJ...
```

#### Lambda Environment Variables (AWS Console)
```bash
S3_BUCKET_NAME=cakewalkbucket2
AWS_REGION=ap-south-1
ADMIN_PASSWORD_HASH=$2a$10$...
```

### GitHub Secrets
```bash
AWS_ROLE_ARN=arn:aws:iam::account-id:role/github-actions-role
REACT_APP_API_BASE_URL=https://[api-id].execute-api.ap-south-1.amazonaws.com/api
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
```

---

## Key Files Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `frontend/package.json` | Frontend dependencies and scripts |
| `backend/package.json` | Backend dependencies and scripts |
| `frontend/src/config.js` | Frontend API base URL configuration |
| `frontend/src/setupProxy.js` | Dev proxy for API requests |
| `backend/.env` | Backend environment variables (local) |

### Entry Points

| File | Purpose |
|------|---------|
| `frontend/src/index.js` | React app entry point |
| `frontend/src/App.js` | Main app component with routing |
| `backend/local-server.js` | Local development server |
| `backend/get-cakes-lambda.js` | Production Lambda handler |

### Deployment Scripts

| File | Purpose |
|------|---------|
| `run-local.sh` | Start both frontend and backend locally |
| `backend/deploy-lambdas.sh` | Deploy Lambda functions |
| `infrastructure/create-frontend-infrastructure.sh` | Create S3/CloudFront |
| `.github/workflows/deploy-frontend.yml` | Frontend CI/CD |
| `.github/workflows/deploy-backend.yml` | Backend CI/CD |

### Documentation

| File | Purpose |
|------|---------|
| `docs/APPLICATION_OVERVIEW.md` | This file - complete overview |
| `docs/ARCHITECTURE.md` | Deployment architecture details |
| `docs/LAMBDA_DOCUMENTATION.md` | Lambda function documentation |
| `docs/DEPLOYMENT_SUMMARY.md` | Deployment procedures |
| `docs/ADMIN_GUIDE.md` | Admin panel usage guide |
| `backend/README.md` | Backend setup and deployment |
| `frontend/README-ACW.md` | Frontend setup and deployment |

---

## Development Workflow

### Local Development

1. **Start Backend**:
```bash
cd backend
npm install
node local-server.js
# Server runs on http://localhost:3001
```

2. **Start Frontend**:
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

3. **Or use convenience script**:
```bash
./run-local.sh
```

### Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Deployment

**Frontend**:
- Push to `main` branch with changes in `frontend/**`
- GitHub Actions automatically builds and deploys

**Backend**:
- Push to `main` branch with changes in `backend/**`
- GitHub Actions automatically packages and deploys Lambdas

---

## Common Tasks

### Add a New Page
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.js`
3. Add navigation link in `frontend/src/components/common/Header.js`

### Add a New API Endpoint
1. Add route in `backend/local-server.js`
2. Create new Lambda function file
3. Update API Gateway configuration
4. Add deployment to `backend/deploy-lambdas.sh`

### Update Image Metadata
1. Login to admin panel at `/admin`
2. Click "Edit" on image
3. Update fields and save

### Change Admin Password
1. Run `node backend/generate-password-hash.js`
2. Update `ADMIN_PASSWORD_HASH` in `.env` (local)
3. Update Lambda environment variable (production)

---

## Troubleshooting

### Common Issues

**CORS Errors**:
- Check API Gateway CORS configuration
- Verify Lambda response headers include CORS headers
- Ensure frontend origin matches allowed origins

**Upload Failures**:
- Check API Gateway binary media types include `multipart/form-data`
- Verify Lambda has S3 PutObject permissions
- Check file size limits (10MB default)

**Authentication Issues**:
- Verify `ADMIN_PASSWORD_HASH` is set correctly
- Check token is included in Authorization header
- Ensure token format is `Bearer <token>`

**Images Not Loading**:
- Check S3 bucket name and region
- Verify Lambda has S3 GetObject permissions
- Check pre-signed URL expiry (1 hour default)

---

## Security Considerations

1. **S3 Bucket**: Private, accessed only via Lambda
2. **Admin Access**: Password-protected with bcrypt hashing
3. **API Authentication**: Bearer token for protected endpoints
4. **Pre-signed URLs**: Time-limited (1 hour) access to images
5. **CORS**: Configured to allow only specific origins
6. **Environment Variables**: Sensitive data not committed to git
7. **IAM Roles**: Least privilege principle for Lambda execution

---

## Performance Optimizations

1. **CloudFront CDN**: Caches static assets globally
2. **Pre-signed URLs**: Direct S3 access, no Lambda overhead
3. **Lazy Loading**: Images loaded on demand
4. **Code Splitting**: React lazy loading for routes
5. **Compression**: Gzip/Brotli enabled on CloudFront
6. **Image Optimization**: Recommended before upload

---

## Future Enhancements

See `docs/tech_debt.md` for planned improvements:
- JWT-based authentication
- Image resizing/optimization pipeline
- Admin user management
- Order management system
- Payment integration
- Email notifications
- Analytics dashboard

---

## Support & Resources

- **Architecture Diagram**: `docs/ARCHITECTURE.md`
- **Lambda Details**: `docs/LAMBDA_DOCUMENTATION.md`
- **Deployment Guide**: `docs/DEPLOYMENT_SUMMARY.md`
- **Admin Guide**: `docs/ADMIN_GUIDE.md`
- **Domain Setup**: `docs/README_DOMAIN_SETUP.md`

---

**Document Maintenance**: Update this file when adding new features, modules, or making architectural changes.
