# AWS Lambda Functions Documentation

**Project:** Alka's CakeWalk  
**Version:** MVP1  
**Runtime:** Node.js 18.x  
**Region:** ap-south-1 (Mumbai)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [acw-get-cakes-lambda](#acw-get-cakes-lambda)
3. [acw-auth-lambda](#acw-auth-lambda)
4. [acw-upload-lambda](#acw-upload-lambda)
5. [Common Patterns](#common-patterns)
6. [Error Handling](#error-handling)
7. [Monitoring](#monitoring)

---

## Overview

The application uses three AWS Lambda functions to handle backend operations:

| Function | Purpose | Trigger | Auth Required |
|----------|---------|---------|---------------|
| acw-get-cakes-lambda | List cakes | API Gateway GET | No |
| acw-auth-lambda | Authentication | API Gateway POST | No |
| acw-upload-lambda | Upload images | API Gateway POST | Yes |

### **Common Configuration**

- **Runtime:** Node.js 18.x
- **Architecture:** x86_64
- **Deployment:** Automated via GitHub Actions
- **Integration:** Lambda Proxy Integration with API Gateway
- **Logging:** CloudWatch Logs

---

## acw-get-cakes-lambda

### **Purpose**

Retrieves the list of cakes from S3 storage and generates presigned URLs for secure image access.

### **Configuration**

```yaml
Function Name: acw-get-cakes-lambda
Runtime: Node.js 18.x
Handler: index.handler
Memory: 256 MB
Timeout: 30 seconds
```

### **Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `S3_BUCKET_NAME` | S3 bucket containing cake images | `cakewalkbucket2` |

### **IAM Permissions Required**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::cakewalkbucket2",
        "arn:aws:s3:::cakewalkbucket2/*"
      ]
    }
  ]
}
```

### **Request**

```http
GET /prod/api/cakes HTTP/1.1
Host: lcs5qocz3b.execute-api.ap-south-1.amazonaws.com
```

**No request body required.**

### **Response**

**Success (200):**
```json
[
  {
    "id": "uuid-here.jpeg",
    "name": "Chocolate Cake",
    "description": "Delicious chocolate cake",
    "category": "birthday",
    "tags": ["chocolate", "birthday"],
    "originalname": "cake.jpeg",
    "alt": "Image of Chocolate Cake",
    "src": "https://cakewalkbucket2.s3.ap-south-1.amazonaws.com/uuid-here.jpeg?X-Amz-...",
    "lastModified": "2025-10-19T10:00:00.000Z",
    "size": 150000
  }
]
```

**Error (500):**
```json
{
  "error": "Failed to fetch cakes",
  "details": "Error message here"
}
```

### **Function Flow**

```
1. Receive GET request
2. Read metadata.json from S3
3. Parse JSON data
4. For each cake:
   a. Generate presigned URL (1 hour expiry)
   b. Add to response array
5. Return array with CORS headers
```

### **Code Structure**

```javascript
exports.handler = async (event) => {
  // 1. Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };

  // 2. Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 3. Fetch metadata from S3
    const metadata = await getMetadataFromS3();
    
    // 4. Generate presigned URLs
    const cakesWithUrls = await Promise.all(
      metadata.map(cake => addPresignedUrl(cake))
    );
    
    // 5. Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(cakesWithUrls)
    };
  } catch (error) {
    // 6. Handle errors
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch cakes' })
    };
  }
};
```

### **Dependencies**

```json
{
  "@aws-sdk/client-s3": "^3.x",
  "@aws-sdk/s3-request-presigner": "^3.x"
}
```

### **Testing**

```bash
# Test via API Gateway
curl https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/prod/api/cakes

# Test via AWS CLI
aws lambda invoke \
  --function-name acw-get-cakes-lambda \
  --payload '{"httpMethod":"GET"}' \
  response.json
```

### **Monitoring**

**CloudWatch Metrics:**
- Invocations
- Duration
- Errors
- Throttles

**CloudWatch Logs:**
- Log Group: `/aws/lambda/acw-get-cakes-lambda`
- Retention: 7 days

---

## acw-auth-lambda

### **Purpose**

Handles admin authentication by validating passwords and generating authentication tokens.

### **Configuration**

```yaml
Function Name: acw-auth-lambda
Runtime: Node.js 18.x
Handler: index.handler
Memory: 256 MB
Timeout: 30 seconds
```

### **Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | `$2b$10$...` |

### **IAM Permissions Required**

No S3 or external service permissions required. Only CloudWatch Logs.

### **Request**

```http
POST /prod/api/auth/login HTTP/1.1
Host: lcs5qocz3b.execute-api.ap-south-1.amazonaws.com
Content-Type: application/json

{
  "password": "admin-password-here"
}
```

### **Response**

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "YWRtaW46MTc2MDg2OTQzMDgzMTowLjk2NTQwMDI5NzI4NzQzMTg="
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Password is required"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Authentication error"
}
```

### **Function Flow**

```
1. Receive POST request with password
2. Validate request body
3. Extract password from request
4. Compare with stored hash using bcrypt
5. If valid:
   a. Generate authentication token
   b. Return success with token
6. If invalid:
   a. Return 401 error
```

### **Authentication Token Format**

```javascript
// Token structure (Base64 encoded)
const tokenData = `admin:${timestamp}:${randomValue}`;
const token = Buffer.from(tokenData).toString('base64');

// Example decoded token:
// "admin:1760869430831:0.9654002972874318"
```

### **Security Features**

- ✅ **Bcrypt Hashing** - Password never stored in plain text
- ✅ **Salt Rounds** - 10 rounds (recommended)
- ✅ **Timing-safe Comparison** - Bcrypt's built-in compare
- ✅ **Token Expiry** - Timestamp included for validation
- ✅ **CORS Protection** - Configured headers

### **Code Structure**

```javascript
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  // 1. Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 2. Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 3. Parse request body
    const body = JSON.parse(event.body || '{}');
    const { password } = body;

    // 4. Validate input
    if (!password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Password is required'
        })
      };
    }

    // 5. Compare password with hash
    const isValid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    // 6. Return appropriate response
    if (isValid) {
      const token = generateToken();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          token
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid password'
        })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Authentication error'
      })
    };
  }
};
```

### **Dependencies**

```json
{
  "bcryptjs": "^2.4.3"
}
```

### **Testing**

```bash
# Test successful login
curl -X POST https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/prod/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"password":"correct-password"}'

# Test failed login
curl -X POST https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/prod/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"password":"wrong-password"}'

# Test OPTIONS (CORS preflight)
curl -X OPTIONS https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/prod/api/auth/login \
  -H 'Origin: https://www.alkascakewalk.com' \
  -H 'Access-Control-Request-Method: POST'
```

### **Monitoring**

**CloudWatch Metrics:**
- Invocations (track login attempts)
- Errors (failed authentications)
- Duration

**CloudWatch Logs:**
- Log Group: `/aws/lambda/acw-auth-lambda`
- Monitor for: Failed login attempts, errors

---

## acw-upload-lambda

### **Purpose**

Handles secure image uploads to S3 with authentication validation and metadata management.

### **Configuration**

```yaml
Function Name: acw-upload-lambda
Runtime: Node.js 18.x
Handler: index.handler
Memory: 512 MB
Timeout: 60 seconds
```

### **Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `S3_BUCKET_NAME` | S3 bucket for uploads | `cakewalkbucket2` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash for token validation | `$2b$10$...` |

### **IAM Permissions Required**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::cakewalkbucket2",
        "arn:aws:s3:::cakewalkbucket2/*"
      ]
    }
  ]
}
```

### **Request**

```http
POST /prod/api/upload HTTP/1.1
Host: lcs5qocz3b.execute-api.ap-south-1.amazonaws.com
Content-Type: multipart/form-data
Authorization: Bearer YWRtaW46MTc2MDg2OTQzMDgzMTowLjk2NTQwMDI5NzI4NzQzMTg=

--boundary
Content-Disposition: form-data; name="image"; filename="cake.jpg"
Content-Type: image/jpeg

[binary image data]
--boundary
Content-Disposition: form-data; name="name"

Chocolate Cake
--boundary
Content-Disposition: form-data; name="description"

Delicious chocolate cake
--boundary
Content-Disposition: form-data; name="category"

birthday
--boundary
Content-Disposition: form-data; name="tags"

chocolate,birthday,custom
--boundary--
```

### **Response**

**Success (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageId": "uuid-here.jpeg",
  "url": "https://cakewalkbucket2.s3.ap-south-1.amazonaws.com/uuid-here.jpeg"
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "No image file provided"
}
```

**Error (413):**
```json
{
  "success": false,
  "message": "File size exceeds 5MB limit"
}
```

**Error (415):**
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG and PNG allowed"
}
```

### **Function Flow**

```
1. Receive POST request with multipart form data
2. Extract Authorization header
3. Validate authentication token
4. Parse multipart form data
5. Validate file:
   a. Check file exists
   b. Check file type (JPEG/PNG)
   c. Check file size (< 5MB)
6. Generate unique filename (UUID)
7. Upload image to S3
8. Read existing metadata.json
9. Add new cake entry to metadata
10. Update metadata.json in S3
11. Return success response
```

### **Validation Rules**

| Rule | Validation | Error |
|------|------------|-------|
| Authentication | Token must be valid | 401 |
| File presence | Image file required | 400 |
| File type | JPEG or PNG only | 415 |
| File size | Maximum 5MB | 413 |
| Required fields | name, description | 400 |

### **Code Structure**

```javascript
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  // 1. Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };

  // 2. Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 3. Validate authentication
    const token = extractToken(event.headers);
    if (!isValidToken(token)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Unauthorized'
        })
      };
    }

    // 4. Parse multipart form data
    const formData = parseMultipartForm(event.body, event.headers);
    
    // 5. Validate file
    validateFile(formData.image);
    
    // 6. Generate unique filename
    const fileExtension = getFileExtension(formData.image.filename);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    
    // 7. Upload to S3
    await uploadToS3(uniqueFilename, formData.image.data);
    
    // 8. Update metadata
    await updateMetadata({
      id: uniqueFilename,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(','),
      originalname: formData.image.filename
    });
    
    // 9. Return success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Image uploaded successfully',
        imageId: uniqueFilename
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Upload failed',
        error: error.message
      })
    };
  }
};
```

### **Dependencies**

```json
{
  "@aws-sdk/client-s3": "^3.x",
  "uuid": "^9.x",
  "busboy": "^1.x"
}
```

### **Testing**

```bash
# Get auth token first
TOKEN=$(curl -s -X POST https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/prod/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"password":"your-password"}' | jq -r '.token')

# Upload image
curl -X POST https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/prod/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@cake.jpg" \
  -F "name=Test Cake" \
  -F "description=Test Description" \
  -F "category=birthday" \
  -F "tags=test,chocolate"
```

### **Monitoring**

**CloudWatch Metrics:**
- Invocations (upload attempts)
- Duration (upload time)
- Errors (failed uploads)
- Throttles

**CloudWatch Logs:**
- Log Group: `/aws/lambda/acw-upload-lambda`
- Monitor for: Upload failures, validation errors, S3 errors

---

## Common Patterns

### **CORS Headers**

All Lambda functions return consistent CORS headers:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};
```

### **OPTIONS Handling**

All functions handle OPTIONS preflight requests:

```javascript
if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
  return {
    statusCode: 200,
    headers,
    body: ''
  };
}
```

### **Error Response Format**

Consistent error response structure:

```javascript
{
  statusCode: 400 | 401 | 500,
  headers: corsHeaders,
  body: JSON.stringify({
    success: false,
    message: 'Error description',
    error: 'Optional error details'
  })
}
```

### **Success Response Format**

Consistent success response structure:

```javascript
{
  statusCode: 200,
  headers: corsHeaders,
  body: JSON.stringify({
    success: true,
    message: 'Operation successful',
    data: { /* response data */ }
  })
}
```

---

## Error Handling

### **Error Categories**

| Category | Status Code | Example |
|----------|-------------|---------|
| Client Error | 400 | Missing required field |
| Authentication | 401 | Invalid token |
| Forbidden | 403 | Insufficient permissions |
| Not Found | 404 | Resource doesn't exist |
| Payload Too Large | 413 | File size exceeds limit |
| Unsupported Media | 415 | Invalid file type |
| Server Error | 500 | S3 operation failed |

### **Error Logging**

All functions log errors to CloudWatch:

```javascript
console.error('Error details:', {
  error: error.message,
  stack: error.stack,
  event: event
});
```

### **Retry Strategy**

- **Client Errors (4xx):** No retry
- **Server Errors (5xx):** API Gateway retries twice
- **Timeout:** Lambda timeout triggers retry

---

## Monitoring

### **CloudWatch Dashboards**

Create custom dashboard with:
- Invocation count per function
- Error rate
- Duration (p50, p95, p99)
- Throttles

### **CloudWatch Alarms**

Recommended alarms:

```yaml
Alarms:
  - Name: HighErrorRate
    Metric: Errors
    Threshold: > 5 in 5 minutes
    
  - Name: HighDuration
    Metric: Duration
    Threshold: > 5000ms
    
  - Name: Throttles
    Metric: Throttles
    Threshold: > 0
```

### **Log Insights Queries**

**Find errors:**
```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
```

**Track login attempts:**
```
fields @timestamp, @message
| filter @message like /Login/
| stats count() by bin(5m)
```

**Monitor upload performance:**
```
fields @timestamp, @duration
| filter @message like /Upload/
| stats avg(@duration), max(@duration), min(@duration)
```

---

## Deployment

### **Automated Deployment**

All Lambda functions are deployed automatically via GitHub Actions when changes are pushed to `main` branch.

**Workflow:** `.github/workflows/deploy-backend.yml`

**Steps:**
1. Package Lambda with dependencies
2. Create ZIP file
3. Update Lambda function code
4. Update environment variables
5. Wait for function to become active

### **Manual Deployment**

If needed, deploy manually:

```bash
# Package Lambda
cd backend
npm install --production
zip -r function.zip index.js node_modules/

# Deploy via AWS CLI
aws lambda update-function-code \
  --function-name acw-get-cakes-lambda \
  --zip-file fileb://function.zip

# Update environment variables
aws lambda update-function-configuration \
  --function-name acw-get-cakes-lambda \
  --environment Variables={S3_BUCKET_NAME=cakewalkbucket2}
```

---

## Best Practices

### **Security**

- ✅ Never log sensitive data (passwords, tokens)
- ✅ Use environment variables for secrets
- ✅ Validate all inputs
- ✅ Use least privilege IAM roles
- ✅ Enable encryption at rest

### **Performance**

- ✅ Reuse AWS SDK clients
- ✅ Use async/await properly
- ✅ Minimize cold starts (keep functions warm)
- ✅ Optimize package size
- ✅ Use appropriate memory settings

### **Reliability**

- ✅ Implement proper error handling
- ✅ Log important events
- ✅ Set appropriate timeouts
- ✅ Use idempotent operations
- ✅ Handle partial failures

### **Cost Optimization**

- ✅ Right-size memory allocation
- ✅ Minimize execution time
- ✅ Use S3 presigned URLs (avoid Lambda proxying)
- ✅ Clean up old logs
- ✅ Monitor unused functions

---

## Troubleshooting

### **Common Issues**

**Issue:** Lambda timeout
- **Cause:** S3 operation taking too long
- **Solution:** Increase timeout, optimize S3 operations

**Issue:** Memory exceeded
- **Cause:** Large file processing
- **Solution:** Increase memory allocation

**Issue:** CORS errors
- **Cause:** Missing or incorrect CORS headers
- **Solution:** Verify headers in response

**Issue:** Authentication fails
- **Cause:** Token validation error
- **Solution:** Check token format and expiry

**Issue:** S3 access denied
- **Cause:** Missing IAM permissions
- **Solution:** Update Lambda execution role

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Oct 19, 2025 | Initial MVP1 release |

---

**Last Updated:** October 19, 2025  
**Maintained By:** Kuldip Kumar
