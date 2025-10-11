# Technical Debt Tracker

This document tracks technical debt items that need to be addressed. Items are prioritized and will be tackled incrementally.

**Last Updated:** 2025-10-11 21:22 (UTC+05:30)

---

## 🔴 Critical Priority

### 1. API Endpoint Mismatch
- **Status:** 🔴 Open
- **Location:** `frontend/src/services/s3Service.js:4`
- **Issue:** Upload endpoint is `/cakes` but should be `/upload`
- **Current Code:**
  ```javascript
  const response = await fetch(`${baseUrl}/cakes`, {
  ```
- **Expected:**
  ```javascript
  const response = await fetch(`${baseUrl}/upload`, {
  ```
- **Impact:** Upload functionality is broken
- **Effort:** 5 minutes
- **Assigned:** Unassigned
- **Notes:** This is blocking the admin upload feature

---

### 2. No Authentication on Admin Page
- **Status:** 🔴 Open
- **Location:** `frontend/src/pages/AdminPage.js`
- **Issue:** Admin upload page has no authentication - anyone can access and upload
- **Impact:** Security vulnerability - unauthorized uploads possible
- **Effort:** 2-4 hours
- **Assigned:** Unassigned
- **Suggested Solutions:**
  - Add AWS Cognito authentication
  - Implement simple password protection
  - Add API key validation in Lambda
- **Notes:** High security risk for production deployment

---

### 3. No File Validation
- **Status:** 🔴 Open
- **Location:** `backend/upload-to-s3-lambda.js`
- **Issue:** No validation for:
  - File size limits
  - File type/MIME type checking
  - Malicious file detection
  - Metadata sanitization (XSS risk)
- **Impact:** 
  - Potential for large file uploads (cost implications)
  - Security vulnerability (malicious uploads, XSS via metadata)
- **Effort:** 2-3 hours
- **Assigned:** Unassigned
- **Suggested Implementation:**
  ```javascript
  // Add validation
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.content.length > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  if (!ALLOWED_TYPES.includes(file.contentType)) {
    throw new Error('Invalid file type');
  }
  
  // Sanitize metadata to prevent XSS
  const sanitize = (str) => str.replace(/[<>]/g, '');
  ```
- **Notes:** Critical for production security and cost control

---

## 🟡 High Priority

### 4. Duplicate S3 Client Creation
- **Status:** 🟡 Open
- **Location:** `backend/get-cakes-lambda.js:10, 23`
- **Issue:** S3Client instantiated twice unnecessarily
- **Current Code:**
  ```javascript
  // Line 10
  const s3Client = new S3Client({ region: REGION });
  
  // Line 23 (inside handler)
  const client = new S3Client({ region: REGION });
  ```
- **Fix:** Remove line 23, use `s3Client` throughout
- **Impact:** Minor performance overhead, code duplication
- **Effort:** 2 minutes
- **Assigned:** Unassigned

---

### 5. Environment Variable Inconsistency
- **Status:** 🟡 Open
- **Location:** `frontend/src/services/s3Service.js`, `frontend/src/pages/GalleryPage.js`
- **Issue:** Direct use of `process.env.REACT_APP_API_BASE_URL` instead of centralized config
- **Current:** Multiple files access env var directly
- **Expected:** Import from `config.js`
  ```javascript
  import { API_BASE } from '../config';
  const response = await fetch(`${API_BASE}/cakes`);
  ```
- **Impact:** Harder to maintain, inconsistent configuration
- **Effort:** 15 minutes
- **Assigned:** Unassigned
- **Files to Update:**
  - `frontend/src/services/s3Service.js`
  - `frontend/src/pages/GalleryPage.js`

---

### 6. Missing Error Context in Upload Lambda
- **Status:** 🟡 Open
- **Location:** `backend/upload-to-s3-lambda.js:37`
- **Issue:** Generic error doesn't show what fields were actually received
- **Current:**
  ```javascript
  throw new Error('No file uploaded. Please ensure the file field is named \'image\'.');
  ```
- **Better:**
  ```javascript
  throw new Error(`No file uploaded. Received fields: ${Object.keys(result).join(', ')}`);
  ```
- **Impact:** Harder to debug upload issues
- **Effort:** 5 minutes
- **Assigned:** Unassigned

---

### 7. Mixed AWS SDK Versions
- **Status:** 🟡 Open
- **Location:** `backend/package.json`
- **Issue:** Both AWS SDK v2 and v3 installed
- **Current Dependencies:**
  ```json
  "aws-sdk": "^2.1568.0",  // v2 (used in local-server.js)
  "@aws-sdk/client-s3": "^3.525.0",  // v3 (used in Lambdas)
  ```
- **Impact:** Larger bundle size, potential conflicts
- **Effort:** 1-2 hours (need to migrate local-server.js to v3)
- **Assigned:** Unassigned
- **Notes:** Consider migrating `local-server.js` to AWS SDK v3 or keeping v2 only for local dev

---

## 🟢 Medium Priority

### 8. No Error Boundaries in React
- **Status:** 🟢 Open
- **Location:** `frontend/src/App.js`
- **Issue:** No React error boundaries to catch component errors
- **Impact:** Poor UX when errors occur - white screen instead of graceful fallback
- **Effort:** 1 hour
- **Assigned:** Unassigned
- **Suggested Implementation:**
  ```javascript
  class ErrorBoundary extends React.Component {
    state = { hasError: false };
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
    render() {
      if (this.state.hasError) {
        return <h1>Something went wrong. Please refresh.</h1>;
      }
      return this.props.children;
    }
  }
  ```

---

### 9. Hardcoded Configuration Values
- **Status:** 🟢 Open
- **Location:** Multiple files
- **Issue:** Hardcoded fallback values scattered across codebase
- **Examples:**
  - Bucket name: `'cakewalkbucket2'`
  - Region: `'ap-south-1'`
  - Pre-signed URL expiry: `3600` seconds
- **Impact:** Harder to maintain, change environments
- **Effort:** 1 hour
- **Assigned:** Unassigned
- **Suggested Solution:** Create centralized config file for backend

---

### 10. Missing API Documentation
- **Status:** 🟢 Open
- **Location:** N/A (needs to be created)
- **Issue:** No OpenAPI/Swagger documentation for API endpoints
- **Impact:** Frontend developers must read Lambda code to understand API
- **Effort:** 2-3 hours
- **Assigned:** Unassigned
- **Suggested:** Create `API.md` with:
  - `GET /api/cakes` - List all cakes with metadata
  - `POST /api/upload` - Upload image with metadata
  - Request/response examples
  - Error codes

---

### 11. No Image Optimization
- **Status:** 🟢 Open
- **Location:** `backend/upload-to-s3-lambda.js`
- **Issue:** Images uploaded as-is without resizing/compression
- **Impact:** 
  - Higher S3 storage costs
  - Slower page loads
  - Higher bandwidth costs
- **Effort:** 3-4 hours
- **Assigned:** Unassigned
- **Suggested Libraries:**
  - `sharp` for image processing in Lambda
  - Create multiple sizes (thumbnail, medium, full)
- **Notes:** May require Lambda layer for sharp binary

---

### 12. No Client-Side Caching
- **Status:** 🟢 Open
- **Location:** `frontend/src/pages/GalleryPage.js`
- **Issue:** Fetches cakes on every page load, no caching
- **Impact:** Unnecessary API calls, slower UX
- **Effort:** 1-2 hours
- **Assigned:** Unassigned
- **Suggested Solutions:**
  - React Query for caching
  - LocalStorage with TTL
  - Service Worker caching

---

## 🔵 Low Priority

### 13. No Unit Tests
- **Status:** 🔵 Open
- **Issue:** No unit tests for React components or Lambda functions
- **Impact:** Harder to refactor, risk of regressions
- **Effort:** Ongoing
- **Assigned:** Unassigned
- **Suggested:** Start with critical paths (upload, gallery display)

---

### 14. No Pagination
- **Status:** 🔵 Open
- **Location:** `frontend/src/pages/GalleryPage.js`
- **Issue:** All cakes loaded at once
- **Impact:** Performance issues with large galleries (100+ images)
- **Effort:** 2-3 hours
- **Assigned:** Unassigned

---

### 15. Missing Features
- **Status:** 🔵 Open
- **Issue:** Several features not implemented:
  - Image deletion
  - Image editing/updating
  - Search functionality
  - Analytics tracking
  - Email integration for contact form
- **Impact:** Limited functionality
- **Effort:** Varies (1-8 hours per feature)
- **Assigned:** Unassigned
- **Notes:** Prioritize based on user needs

---

## Completed Items

_No items completed yet_

---

## Notes

- **Priority Levels:**
  - 🔴 **Critical:** Blocking issues, security vulnerabilities, broken functionality
  - 🟡 **High:** Important improvements, code quality issues
  - 🟢 **Medium:** Nice-to-have improvements, performance optimizations
  - 🔵 **Low:** Future enhancements, non-urgent items

- **Status Indicators:**
  - 🔴 Open
  - 🟡 In Progress
  - 🟢 In Review
  - ✅ Completed

---

## Quick Wins (< 30 minutes)

These items can be tackled quickly for immediate improvement:

1. ✅ **API Endpoint Mismatch** (5 min) - Fix upload endpoint
2. ✅ **Duplicate S3 Client** (2 min) - Remove duplicate instantiation
3. ✅ **Missing Error Context** (5 min) - Improve error message
4. ✅ **Centralize Config** (15 min) - Use config.js consistently

**Total Quick Wins Time:** ~30 minutes

---

## Sprint Planning

### Sprint 1 (Recommended)
Focus on critical security and functionality issues:
- [ ] Fix API endpoint mismatch
- [ ] Add file validation (size, type)
- [ ] Implement basic authentication
- [ ] Remove duplicate S3 client
- [ ] Centralize environment variables

**Estimated Time:** 4-6 hours

### Sprint 2
Code quality and performance:
- [ ] Migrate to single AWS SDK version
- [ ] Add error boundaries
- [ ] Create API documentation
- [ ] Implement image optimization

**Estimated Time:** 8-10 hours

### Sprint 3
Features and enhancements:
- [ ] Add client-side caching
- [ ] Implement pagination
- [ ] Add unit tests
- [ ] Implement image deletion

**Estimated Time:** 10-12 hours

---

## References

- Original analysis: `prompt.md`
- Architecture docs: `ARCHITECTURE.md`
- Admin guide: `ADMIN_GUIDE.md`
