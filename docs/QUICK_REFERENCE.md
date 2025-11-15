# ACW Quick Reference Guide

> **TL;DR**: Fast lookup for common tasks and key information

## 🚀 Quick Start

### Local Development
```bash
# Option 1: Use convenience script
./run-local.sh

# Option 2: Manual start
# Terminal 1 - Backend
cd backend && node local-server.js

# Terminal 2 - Frontend  
cd frontend && npm start
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Admin: http://localhost:3000/admin

---

## 📁 Key Files at a Glance

| What | Where |
|------|-------|
| **Complete Overview** | `docs/APPLICATION_OVERVIEW.md` ← **START HERE** |
| **Architecture** | `docs/ARCHITECTURE.md` |
| **Backend Server** | `backend/local-server.js` |
| **Frontend Entry** | `frontend/src/App.js` |
| **API Service** | `frontend/src/services/s3Service.js` |
| **Config** | `frontend/src/config.js` |
| **Lambda Functions** | `backend/*-lambda.js` |
| **CI/CD** | `.github/workflows/` |

---

## 🏗️ Architecture in 30 Seconds

```
Browser → CloudFront → S3 (Frontend) + API Gateway → Lambda → S3 (Images)
```

**Tech:** React + AWS Lambda + S3 + API Gateway + CloudFront  
**Region:** ap-south-1 (Mumbai)  
**Bucket:** cakewalkbucket2

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/cakes` | ❌ | List all images |
| POST | `/api/upload` | ✅ | Upload image |
| PUT | `/api/cakes/:id` | ✅ | Update metadata |
| POST | `/api/auth/login` | ❌ | Admin login |
| GET | `/api/reviews` | ❌ | Google reviews |
| GET | `/health` | ❌ | Health check |

**Auth Format:** `Authorization: Bearer <token>`

---

## 📦 Project Structure

```
acw-website/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── services/    # API layer
│   └── package.json
│
├── backend/           # Serverless backend
│   ├── *-lambda.js    # Lambda functions
│   ├── local-server.js # Dev server
│   └── package.json
│
├── infrastructure/    # Deployment scripts
├── .github/workflows/ # CI/CD
└── docs/             # Documentation
```

---

## 🎯 Common Tasks

### Upload an Image
1. Go to `/admin`
2. Login with password
3. Fill form and select image
4. Click "Upload Image"

### Update Image Metadata
1. Login to admin panel
2. Click "Edit" on image
3. Modify fields
4. Click "Save Changes"

### Set Landing Page Hero
1. Edit image metadata
2. Check "Set as Landing Image"
3. Save (automatically unsets others)

### Deploy Frontend
```bash
git add frontend/
git commit -m "Update frontend"
git push origin main
# GitHub Actions deploys automatically
```

### Deploy Backend
```bash
git add backend/
git commit -m "Update backend"
git push origin main
# GitHub Actions deploys automatically
```

### Change Admin Password
```bash
cd backend
node generate-password-hash.js
# Copy hash to .env and Lambda env vars
```

---

## 🔧 Environment Variables

### Frontend (.env)
```bash
REACT_APP_API_BASE_URL=https://[api-id].execute-api.ap-south-1.amazonaws.com/api
```

### Backend (.env)
```bash
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-south-1
S3_BUCKET_NAME=cakewalkbucket2
PORT=3001
ADMIN_PASSWORD_HASH=$2a$10$...
GOOGLE_PLACES_API_KEY=xxx  # optional
GOOGLE_PLACE_ID=xxx         # optional
```

### Lambda Environment
```bash
S3_BUCKET_NAME=cakewalkbucket2
AWS_REGION=ap-south-1
ADMIN_PASSWORD_HASH=$2a$10$...
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **CORS errors** | Check API Gateway CORS config, verify Lambda headers |
| **Upload fails** | Check binary media types in API Gateway, verify S3 permissions |
| **Auth fails** | Verify ADMIN_PASSWORD_HASH is set, check token format |
| **Images not loading** | Check S3 permissions, verify pre-signed URL generation |
| **Local dev not working** | Check .env file, ensure AWS credentials are set |

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| `APPLICATION_OVERVIEW.md` | Complete system reference |
| `ARCHITECTURE.md` | Deployment architecture |
| `LAMBDA_DOCUMENTATION.md` | Lambda function details |
| `DEPLOYMENT_SUMMARY.md` | Deployment procedures |
| `ADMIN_GUIDE.md` | Admin panel usage |
| `QUICK_REFERENCE.md` | This file |
| `backend/README.md` | Backend setup |
| `frontend/README-ACW.md` | Frontend setup |

---

## 🔑 Key Concepts

**Pre-signed URLs**: Time-limited (1hr) URLs for secure S3 access  
**Serverless**: No servers to manage, auto-scaling  
**OIDC**: GitHub Actions authenticate to AWS without long-lived credentials  
**Metadata**: Stored in S3 object metadata (title, description, category, tags)  
**Landing Image**: Special flag to mark hero image for homepage

---

## 📊 Module Overview

1. **Image Gallery** - Display cakes with filtering
2. **Admin Panel** - Manage images and metadata
3. **Landing Page** - Hero, carousel, testimonials
4. **Menu Page** - Categories and pricing
5. **Contact Page** - Business info
6. **Theme System** - Light/dark mode

---

## 🚦 Status Check

```bash
# Check backend health
curl http://localhost:3001/health

# Check if AWS creds work
cd backend && node test-aws-credentials.js

# Check S3 access
cd backend && node test-s3-access.js
```

---

## 💡 Pro Tips

1. **Always check `APPLICATION_OVERVIEW.md` first** for comprehensive info
2. Use `run-local.sh` for quick local development
3. Test locally before pushing to production
4. Check GitHub Actions logs for deployment issues
5. Use CloudFront invalidation after frontend deploys
6. Keep Lambda functions under 10MB for faster cold starts
7. Monitor AWS Free Tier usage to avoid charges

---

## 🔗 Quick Links

- **Local Frontend**: http://localhost:3000
- **Local Backend**: http://localhost:3001
- **Local Admin**: http://localhost:3000/admin
- **Health Check**: http://localhost:3001/health
- **GitHub Repo**: (your repo URL)
- **Production URL**: (your CloudFront URL)

---

**Need More Details?** → See `docs/APPLICATION_OVERVIEW.md`
