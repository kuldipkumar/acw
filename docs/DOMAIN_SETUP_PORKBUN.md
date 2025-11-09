# Domain Configuration Guide: alkascakewalk.com (Porkbun)

This guide will help you configure your Porkbun domain `alkascakewalk.com` to work with your existing CloudFront distribution.

---

## Overview

Your current setup:
- **Frontend**: Deployed on S3 + CloudFront
- **Domain**: `alkascakewalk.com` (purchased from Porkbun)
- **Goal**: Point your domain to CloudFront distribution

---

## Step 1: Get Your CloudFront Distribution Details

First, we need to find your CloudFront distribution domain name.

### Option A: From AWS Console
1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Find your distribution (should be named "ACW Frontend Distribution")
3. Copy the **Domain Name** (e.g., `d1234567890abc.cloudfront.net`)

### Option B: Using AWS CLI
```bash
# List all CloudFront distributions
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,DomainName,Comment]' \
  --output table

# Get the specific distribution ID from GitHub Secrets
# Then get its domain name
aws cloudfront get-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text
```

**Save this CloudFront domain name** - you'll need it for DNS configuration.

---

## Step 2: Request SSL Certificate in AWS Certificate Manager (ACM)

CloudFront requires an SSL certificate in the **us-east-1** region.

### 2.1 Request Certificate
1. Go to [AWS Certificate Manager](https://console.aws.amazon.com/acm/home?region=us-east-1)
2. **Important**: Make sure you're in **us-east-1** region (top-right corner)
3. Click **Request a certificate**
4. Choose **Request a public certificate**
5. Add domain names:
   - `alkascakewalk.com`
   - `www.alkascakewalk.com`
6. Choose **DNS validation**
7. Click **Request**

### 2.2 Get DNS Validation Records
After requesting, AWS will provide DNS validation records:
1. Click on your certificate
2. You'll see CNAME records for validation
3. **Keep this page open** - you'll add these to Porkbun

Example validation record:
```
Name: _abc123.alkascakewalk.com
Type: CNAME
Value: _xyz456.acm-validations.aws.
```

---

## Step 3: Configure DNS in Porkbun

### 3.1 Add Certificate Validation Records
1. Log in to [Porkbun](https://porkbun.com/account/domainsSpeedy)
2. Find `alkascakewalk.com` and click **DNS**
3. Add the CNAME records from ACM (Step 2.2):
   - **Type**: CNAME
   - **Host**: `_abc123` (remove `.alkascakewalk.com` part)
   - **Answer**: The full validation value from ACM
   - **TTL**: 600 (default)
4. Click **Add**
5. Repeat for `www` subdomain validation if separate

### 3.2 Wait for Certificate Validation
- Go back to ACM console
- Wait for status to change to **Issued** (usually 5-30 minutes)
- You can refresh the page to check status

---

## Step 4: Add Custom Domain to CloudFront

Once your certificate is **Issued**:

### 4.1 Update CloudFront Distribution
1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Select your distribution
3. Click **Edit**
4. Under **Alternate domain names (CNAMEs)**:
   - Add `alkascakewalk.com`
   - Add `www.alkascakewalk.com`
5. Under **Custom SSL certificate**:
   - Select your newly issued certificate
6. Click **Save changes**
7. Wait for distribution to deploy (5-10 minutes)

### 4.2 Using AWS CLI (Alternative)
```bash
# Get current distribution config
aws cloudfront get-distribution-config \
  --id YOUR_DISTRIBUTION_ID \
  > /tmp/cf-config.json

# Edit the config to add:
# - Aliases: ["alkascakewalk.com", "www.alkascakewalk.com"]
# - ViewerCertificate.ACMCertificateArn: YOUR_CERTIFICATE_ARN

# Update the distribution
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config file:///tmp/cf-config-updated.json \
  --if-match ETAG_FROM_GET_COMMAND
```

---

## Step 5: Point Domain to CloudFront in Porkbun

Now configure your domain to point to CloudFront:

### 5.1 Add DNS Records
Go back to Porkbun DNS settings and add:

#### For Root Domain (alkascakewalk.com)
- **Type**: ALIAS or A Record (if ALIAS not available, use A with CloudFront IP)
- **Host**: `@` (or leave empty)
- **Answer**: Your CloudFront domain (e.g., `d1234567890abc.cloudfront.net`)
- **TTL**: 600

**Note**: Porkbun may not support ALIAS records. If not available:
1. Use **CNAME flattening** if Porkbun offers it
2. Or use **A record** with CloudFront IP addresses (not recommended as IPs can change)
3. Or use **CNAME** for `www` only and redirect root to `www`

#### For WWW Subdomain (www.alkascakewalk.com)
- **Type**: CNAME
- **Host**: `www`
- **Answer**: Your CloudFront domain (e.g., `d1234567890abc.cloudfront.net`)
- **TTL**: 600

### 5.2 Recommended Approach (If ALIAS Not Supported)
If Porkbun doesn't support ALIAS for root domain:

**Option 1: Use Porkbun's URL Redirect**
1. Set up `www.alkascakewalk.com` as CNAME to CloudFront
2. Use Porkbun's redirect feature to redirect `alkascakewalk.com` → `www.alkascakewalk.com`

**Option 2: Use A Records with CloudFront IPs**
1. Get CloudFront IP ranges from AWS
2. Add multiple A records for the root domain
3. **Warning**: CloudFront IPs can change, so this is not ideal

---

## Step 6: Verify Configuration

### 6.1 Check DNS Propagation
```bash
# Check root domain
dig alkascakewalk.com

# Check www subdomain
dig www.alkascakewalk.com

# Check from different DNS servers
dig @8.8.8.8 alkascakewalk.com
dig @1.1.1.1 www.alkascakewalk.com
```

### 6.2 Test HTTPS
```bash
# Test root domain
curl -I https://alkascakewalk.com

# Test www subdomain
curl -I https://www.alkascakewalk.com
```

### 6.3 Browser Test
1. Visit `https://alkascakewalk.com`
2. Visit `https://www.alkascakewalk.com`
3. Check SSL certificate (should show valid and issued by Amazon)

---

## Step 7: Update Environment Variables

Update your frontend to use the new domain:

### 7.1 Update GitHub Secrets
Go to [GitHub Secrets](https://github.com/kuldipkumar/acw/settings/secrets/actions) and update:

- **REACT_APP_API_BASE_URL**: Keep as is (your API Gateway URL)
- Optionally add **REACT_APP_SITE_URL**: `https://alkascakewalk.com`

### 7.2 Update CORS Settings
Update your API Gateway and Lambda CORS settings to allow your new domain:

```javascript
// In your Lambda functions, update CORS headers:
const headers = {
  'Access-Control-Allow-Origin': 'https://alkascakewalk.com',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};
```

Or allow both old and new domains during transition:
```javascript
const allowedOrigins = [
  'https://alkascakewalk.com',
  'https://www.alkascakewalk.com',
  'https://your-cloudfront-domain.cloudfront.net'
];

const origin = event.headers.origin || event.headers.Origin;
const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

const headers = {
  'Access-Control-Allow-Origin': corsOrigin,
  // ... other headers
};
```

---

## Troubleshooting

### Certificate Validation Stuck
- **Issue**: Certificate stays in "Pending validation"
- **Solution**: 
  - Verify CNAME records are correct in Porkbun
  - Check for typos in the record name/value
  - Wait up to 30 minutes
  - Try removing and re-adding the CNAME records

### CloudFront Returns 403 Forbidden
- **Issue**: Domain works but shows 403 error
- **Solution**:
  - Verify S3 bucket policy allows public read
  - Check CloudFront origin settings
  - Ensure default root object is set to `index.html`

### DNS Not Resolving
- **Issue**: Domain doesn't point to CloudFront
- **Solution**:
  - Wait for DNS propagation (up to 48 hours, usually 1-2 hours)
  - Clear your DNS cache: `sudo dscacheutil -flushcache`
  - Check DNS with: `dig alkascakewalk.com`

### SSL Certificate Error
- **Issue**: Browser shows SSL warning
- **Solution**:
  - Ensure certificate is in **us-east-1** region
  - Verify both domain names are in certificate
  - Wait for CloudFront distribution to fully deploy

### CORS Errors After Domain Change
- **Issue**: API calls fail with CORS errors
- **Solution**:
  - Update Lambda CORS headers to include new domain
  - Update API Gateway CORS settings
  - Redeploy API Gateway stage

---

## DNS Configuration Summary

Here's what your final Porkbun DNS should look like:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| CNAME | `_abc123` | `_xyz456.acm-validations.aws.` | 600 |
| CNAME | `www` | `d1234567890abc.cloudfront.net` | 600 |
| ALIAS/CNAME | `@` | `d1234567890abc.cloudfront.net` | 600 |

**Note**: Replace the validation and CloudFront values with your actual values.

---

## Quick Reference Commands

```bash
# Get CloudFront distribution domain
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,DomainName,Comment]' \
  --output table

# Check certificate status
aws acm list-certificates --region us-east-1

# Test DNS resolution
dig alkascakewalk.com
dig www.alkascakewalk.com

# Test HTTPS
curl -I https://alkascakewalk.com
curl -I https://www.alkascakewalk.com

# Flush local DNS cache (Mac)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

---

## Next Steps After Domain is Live

1. ✅ Update social media links
2. ✅ Update Google Search Console with new domain
3. ✅ Set up Google Analytics for new domain
4. ✅ Update any external links or bookmarks
5. ✅ Consider setting up email forwarding (if needed)

---

## Support Resources

- **Porkbun DNS Help**: https://kb.porkbun.com/category/7-dns
- **AWS CloudFront Custom Domains**: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html
- **AWS Certificate Manager**: https://docs.aws.amazon.com/acm/latest/userguide/gs.html

---

**Estimated Time**: 1-2 hours (including DNS propagation)

**Status**: Ready to configure! 🚀
