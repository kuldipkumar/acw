# Fix IAM Permissions for Domain Setup

Your AWS user `acw-website-dev-user` needs additional permissions to configure the custom domain.

---

## The Problem

```
User: arn:aws:iam::148120987993:user/acw-website-dev-user
Missing permissions:
- cloudfront:ListDistributions
- cloudfront:GetDistribution
- cloudfront:GetDistributionConfig
- cloudfront:UpdateDistribution
- acm:RequestCertificate
- acm:DescribeCertificate
- acm:ListCertificates
```

---

## Solution 1: Add Required IAM Permissions (Recommended)

### Step 1: Create IAM Policy

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Policies** → **Create Policy**
3. Click **JSON** tab
4. Paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CloudFrontManagement",
            "Effect": "Allow",
            "Action": [
                "cloudfront:ListDistributions",
                "cloudfront:GetDistribution",
                "cloudfront:GetDistributionConfig",
                "cloudfront:UpdateDistribution",
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ACMCertificateManagement",
            "Effect": "Allow",
            "Action": [
                "acm:RequestCertificate",
                "acm:DescribeCertificate",
                "acm:ListCertificates",
                "acm:GetCertificate",
                "acm:DeleteCertificate"
            ],
            "Resource": "*"
        }
    ]
}
```

5. Click **Next: Tags** (optional)
6. Click **Next: Review**
7. Name: `ACWDomainSetupPolicy`
8. Description: `Permissions for CloudFront and ACM for domain setup`
9. Click **Create policy**

### Step 2: Attach Policy to User

1. Go to **IAM** → **Users**
2. Click on `acw-website-dev-user`
3. Click **Add permissions** → **Attach policies directly**
4. Search for `ACWDomainSetupPolicy`
5. Check the box
6. Click **Add permissions**

### Step 3: Verify Permissions

```bash
# Test CloudFront access
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName]' --output table

# Test ACM access
aws acm list-certificates --region us-east-1 --query 'CertificateSummaryList[*].[DomainName,Status]' --output table
```

### Step 4: Re-run the Script

```bash
cd infrastructure
./configure-custom-domain.sh
```

---

## Solution 2: Manual Configuration (If You Can't Change IAM)

If you don't have permission to modify IAM policies, follow these manual steps:

### Step 1: Get CloudFront Distribution ID

**Option A: From GitHub Secrets**
1. Go to https://github.com/kuldipkumar/acw/settings/secrets/actions
2. Look for `CLOUDFRONT_DISTRIBUTION_ID`
3. Note the value

**Option B: From AWS Console**
1. Log in to AWS Console with admin account
2. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
3. Find your distribution (comment: "ACW Frontend Distribution")
4. Copy the Distribution ID (e.g., `E1234567890ABC`)
5. Copy the Domain Name (e.g., `d123abc.cloudfront.net`)

### Step 2: Request SSL Certificate (AWS Console)

1. Go to [ACM Console - us-east-1](https://console.aws.amazon.com/acm/home?region=us-east-1)
2. **Important**: Ensure you're in **us-east-1** region
3. Click **Request a certificate**
4. Choose **Request a public certificate** → **Next**
5. Add domain names:
   - `alkascakewalk.com`
   - `www.alkascakewalk.com`
6. Validation method: **DNS validation** → **Next**
7. Click **Request**
8. Click on the certificate ARN
9. Note the **CNAME records** for validation

### Step 3: Add DNS Validation Records to Porkbun

1. Go to [Porkbun DNS](https://porkbun.com/account/domainsSpeedy)
2. Click **DNS** for `alkascakewalk.com`
3. For each validation record from ACM:
   - Click **Add**
   - Type: `CNAME`
   - Host: Copy the name (remove `.alkascakewalk.com` part)
     - Example: `_abc123def456.alkascakewalk.com` → use `_abc123def456`
   - Answer: Copy the full value from ACM
   - TTL: `600`
   - Click **Submit**

### Step 4: Wait for Certificate Validation

1. Go back to ACM console
2. Refresh the page every few minutes
3. Wait for status to change to **Issued** (5-30 minutes)
4. Copy the **Certificate ARN** (you'll need this)

### Step 5: Update CloudFront Distribution

1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Select your distribution
3. Click **Edit**
4. Scroll to **Alternate domain names (CNAMEs)**:
   - Click **Add item**
   - Enter: `alkascakewalk.com`
   - Click **Add item**
   - Enter: `www.alkascakewalk.com`
5. Scroll to **Custom SSL certificate**:
   - Click the dropdown
   - Select your certificate (should show `alkascakewalk.com`)
6. Scroll down and click **Save changes**
7. Wait for distribution to deploy (5-15 minutes)

### Step 6: Configure DNS in Porkbun

1. Go to [Porkbun DNS](https://porkbun.com/account/domainsSpeedy)
2. Click **DNS** for `alkascakewalk.com`

**Add WWW subdomain:**
- Click **Add**
- Type: `CNAME`
- Host: `www`
- Answer: Your CloudFront domain (e.g., `d123abc.cloudfront.net`)
- TTL: `600`
- Click **Submit**

**Add root domain (choose one):**

**Option A - If ALIAS supported:**
- Type: `ALIAS`
- Host: `@` (or leave empty)
- Answer: Your CloudFront domain
- TTL: `600`

**Option B - If ALIAS not supported (recommended):**
- Use Porkbun's **URL Redirect** feature
- From: `alkascakewalk.com`
- To: `www.alkascakewalk.com`
- Type: `301 Permanent`

### Step 7: Wait for DNS Propagation

Wait 1-2 hours, then test:

```bash
# Check DNS
dig alkascakewalk.com
dig www.alkascakewalk.com

# Test HTTPS
curl -I https://alkascakewalk.com
curl -I https://www.alkascakewalk.com
```

### Step 8: Update CORS Settings

```bash
cd infrastructure
./update-cors-for-domain.sh
```

Follow the instructions to update Lambda functions with new CORS configuration.

---

## Solution 3: Use Different AWS Profile

If you have another AWS profile with admin access:

```bash
# List available profiles
aws configure list-profiles

# Use admin profile for domain setup
export AWS_PROFILE=admin-profile

# Run the script
cd infrastructure
./configure-custom-domain.sh

# Switch back to dev profile
export AWS_PROFILE=default
```

---

## Recommended IAM Policy (Complete)

For future reference, here's the complete policy your user should have:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3Management",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:PutBucketPolicy",
                "s3:GetBucketPolicy"
            ],
            "Resource": [
                "arn:aws:s3:::acw-*",
                "arn:aws:s3:::acw-*/*"
            ]
        },
        {
            "Sid": "CloudFrontManagement",
            "Effect": "Allow",
            "Action": [
                "cloudfront:ListDistributions",
                "cloudfront:GetDistribution",
                "cloudfront:GetDistributionConfig",
                "cloudfront:UpdateDistribution",
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ACMCertificateManagement",
            "Effect": "Allow",
            "Action": [
                "acm:RequestCertificate",
                "acm:DescribeCertificate",
                "acm:ListCertificates",
                "acm:GetCertificate",
                "acm:DeleteCertificate"
            ],
            "Resource": "*"
        },
        {
            "Sid": "LambdaManagement",
            "Effect": "Allow",
            "Action": [
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:GetFunction",
                "lambda:ListFunctions"
            ],
            "Resource": "arn:aws:lambda:*:*:function:acw-*"
        },
        {
            "Sid": "APIGatewayManagement",
            "Effect": "Allow",
            "Action": [
                "apigateway:GET",
                "apigateway:PUT",
                "apigateway:POST"
            ],
            "Resource": "arn:aws:apigateway:*::/*"
        }
    ]
}
```

---

## Quick Fix Commands

### If you have admin access:

```bash
# Create and attach policy using AWS CLI
aws iam create-policy \
  --policy-name ACWDomainSetupPolicy \
  --policy-document file://domain-setup-policy.json

aws iam attach-user-policy \
  --user-name acw-website-dev-user \
  --policy-arn arn:aws:iam::148120987993:policy/ACWDomainSetupPolicy
```

---

## Troubleshooting

### Still getting AccessDenied?

1. **Check IAM policy is attached**:
   ```bash
   aws iam list-attached-user-policies --user-name acw-website-dev-user
   ```

2. **Check policy permissions**:
   ```bash
   aws iam get-policy-version \
     --policy-arn arn:aws:iam::148120987993:policy/ACWDomainSetupPolicy \
     --version-id v1
   ```

3. **Wait for IAM propagation** (up to 5 minutes)

4. **Try with fresh credentials**:
   ```bash
   aws configure list
   rm -rf ~/.aws/cli/cache
   ```

---

## Next Steps

After fixing permissions:

1. **Re-run the script**:
   ```bash
   cd infrastructure
   ./configure-custom-domain.sh
   ```

2. **Or follow manual steps** in Solution 2 above

3. **Continue with** `DOMAIN_QUICK_START.md`

---

## Support

- **AWS IAM Documentation**: https://docs.aws.amazon.com/IAM/latest/UserGuide/
- **CloudFront Permissions**: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/access-control-overview.html
- **ACM Permissions**: https://docs.aws.amazon.com/acm/latest/userguide/security-iam.html

---

**Choose your solution and proceed!** 🚀
