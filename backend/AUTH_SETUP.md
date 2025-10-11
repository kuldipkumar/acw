# Admin Authentication Setup

This guide explains how to set up password authentication for the admin page.

## Quick Setup

### 1. Generate Password Hash

Run the password hash generator script with your desired password:

```bash
node generate-password-hash.js yourSecurePassword
```

Example:
```bash
node generate-password-hash.js admin123
```

This will output something like:
```
ADMIN_PASSWORD_HASH=$2a$10$abcdefghijklmnopqrstuvwxyz1234567890
```

### 2. Add to Environment Variables

#### For Local Development:

Add the generated hash to your `backend/.env` file:

```env
ADMIN_PASSWORD_HASH=$2a$10$abcdefghijklmnopqrstuvwxyz1234567890
```

#### For AWS Lambda (Production):

Add the hash as an environment variable in your Lambda function configuration:

1. Go to AWS Lambda Console
2. Select your `upload-to-s3` Lambda function
3. Go to Configuration → Environment variables
4. Add new variable:
   - Key: `ADMIN_PASSWORD_HASH`
   - Value: `$2a$10$abcdefghijklmnopqrstuvwxyz1234567890`

Also add it to your `auth-lambda` function if deploying separately.

### 3. Test Authentication

1. Start your local server:
   ```bash
   node local-server.js
   ```

2. Navigate to `/admin` page in your browser

3. Enter your password (e.g., `admin123`)

4. You should be logged in and able to upload images

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** - Minimum 12 characters recommended
3. **Change default password** - Don't use `admin123` in production!
4. **HTTPS only** - Always use HTTPS in production
5. **Token expiration** - Current implementation uses simple tokens. Consider upgrading to JWT with expiration for production.

## How It Works

### Frontend Flow:
1. User visits `/admin` page
2. If not authenticated, shows login form
3. User enters password
4. Frontend sends password to `/api/auth/login`
5. Backend verifies password against bcrypt hash
6. If valid, returns authentication token
7. Token stored in localStorage
8. Token sent with all upload requests in Authorization header

### Backend Flow:
1. Login endpoint (`/api/auth/login`) verifies password
2. Upload endpoint (`/api/upload`) requires valid token
3. Token validated before allowing upload

## Upgrading to Production

For production use, consider upgrading to:

1. **JWT tokens** with expiration
2. **AWS Cognito** for managed authentication
3. **Multi-factor authentication (MFA)**
4. **Rate limiting** on login endpoint
5. **Account lockout** after failed attempts

## Troubleshooting

### "Authentication not configured" error
- Make sure `ADMIN_PASSWORD_HASH` is set in your `.env` file
- Restart your local server after adding the variable

### "Invalid password" error
- Double-check you're using the correct password
- Verify the hash was generated correctly
- Make sure there are no extra spaces in the `.env` file

### Token not persisting
- Check browser localStorage
- Make sure cookies/localStorage are enabled
- Try clearing browser cache

## API Endpoints

### POST /api/auth/login
Login endpoint

**Request:**
```json
{
  "password": "yourPassword"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "base64EncodedToken"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

### POST /api/upload
Protected upload endpoint (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Response (Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized: No valid authentication token provided"
}
```

## Password Management

### Changing Password

1. Generate new hash:
   ```bash
   node generate-password-hash.js newPassword
   ```

2. Update `.env` file with new hash

3. Restart server

4. All existing tokens will remain valid until logout

### Multiple Admins

Current implementation supports single password. For multiple admins:

1. Upgrade to database-backed authentication
2. Use AWS Cognito User Pool
3. Implement role-based access control (RBAC)
