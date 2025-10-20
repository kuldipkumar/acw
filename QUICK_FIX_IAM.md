# Quick Fix: IAM Permissions Error

Your AWS user needs CloudFront and ACM permissions. Here are the fastest solutions:

---

## 🚀 Fastest Fix (If You Have Admin Access)

### Option 1: AWS Console (5 minutes)

1. **Go to IAM Console**: https://console.aws.amazon.com/iam/
2. **Users** → `acw-website-dev-user` → **Add permissions**
3. **Attach policies directly** → Search: `CloudFrontFullAccess`
4. Check `CloudFrontFullAccess` and `AWSCertificateManagerFullAccess`
5. Click **Add permissions**
6. Re-run: `./configure-custom-domain.sh`

### Option 2: AWS CLI (1 minute)

```bash
# Attach managed policies
aws iam attach-user-policy \
  --user-name acw-website-dev-user \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

aws iam attach-user-policy \
  --user-name acw-website-dev-user \
  --policy-arn arn:aws:iam::aws:policy/AWSCertificateManagerFullAccess

# Wait 30 seconds for propagation
sleep 30

# Re-run the script
cd infrastructure
./configure-custom-domain.sh
```

---

## 🔐 Secure Fix (Least Privilege)

Use the custom policy we created:

```bash
# Create custom policy
aws iam create-policy \
  --policy-name ACWDomainSetupPolicy \
  --policy-document file://infrastructure/domain-setup-policy.json

# Attach to user
aws iam attach-user-policy \
  --user-name acw-website-dev-user \
  --policy-arn arn:aws:iam::148120987993:policy/ACWDomainSetupPolicy

# Re-run the script
cd infrastructure
./configure-custom-domain.sh
```

---

## 🛠️ Manual Alternative (No IAM Changes Needed)

If you can't modify IAM, do it manually via AWS Console:

### 1. Get CloudFront Distribution ID

Check GitHub Secrets or AWS Console:
- GitHub: https://github.com/kuldipkumar/acw/settings/secrets/actions
- Look for: `CLOUDFRONT_DISTRIBUTION_ID`

### 2. Request Certificate

1. Go to: https://console.aws.amazon.com/acm/home?region=us-east-1
2. **Request certificate** → Public → Add domains:
   - `alkascakewalk.com`
   - `www.alkascakewalk.com`
3. DNS validation → **Request**
4. Copy the CNAME records

### 3. Add DNS Records to Porkbun

1. Go to: https://porkbun.com/account/domainsSpeedy
2. Click **DNS** for `alkascakewalk.com`
3. Add the CNAME records from ACM
4. Wait for certificate to be **Issued** (5-30 min)

### 4. Update CloudFront

1. Go to: https://console.aws.amazon.com/cloudfront/
2. Select your distribution → **Edit**
3. Add alternate domain names:
   - `alkascakewalk.com`
   - `www.alkascakewalk.com`
4. Select your SSL certificate
5. **Save changes**

### 5. Add Domain DNS Records

In Porkbun, add:
- CNAME: `www` → `YOUR_CLOUDFRONT_DOMAIN.cloudfront.net`
- ALIAS or redirect: `@` → `www.alkascakewalk.com`

---

## ✅ Verify It Worked

```bash
# Test CloudFront access
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName]' --output table

# If this works, you're good to go!
cd infrastructure
./configure-custom-domain.sh
```

---

## 📚 Full Details

See `FIX_IAM_PERMISSIONS.md` for complete documentation.

---

**Choose your approach and continue!** 🚀
