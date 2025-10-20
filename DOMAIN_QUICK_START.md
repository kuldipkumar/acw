# Quick Start: Configure alkascakewalk.com Domain

This is a simplified guide to get your Porkbun domain working with your CloudFront distribution.

---

## Prerequisites

- ✅ Domain purchased from Porkbun: `alkascakewalk.com`
- ✅ CloudFront distribution already deployed
- ✅ AWS CLI configured with appropriate credentials
- ✅ Access to Porkbun DNS management

---

## Quick Setup (3 Main Steps)

### Step 1: Run the Configuration Script

This automated script will:
- Request an SSL certificate
- Update your CloudFront distribution
- Provide DNS records to add

```bash
cd infrastructure
./configure-custom-domain.sh
```

**What it does:**
1. Finds your CloudFront distribution
2. Requests SSL certificate in AWS Certificate Manager (us-east-1)
3. Shows you DNS validation records
4. Updates CloudFront with your custom domain

**Time required:** 5-10 minutes (plus waiting for certificate validation)

---

### Step 2: Configure DNS in Porkbun

#### 2.1 Add Certificate Validation Records

1. Go to [Porkbun DNS Management](https://porkbun.com/account/domainsSpeedy)
2. Click **DNS** for `alkascakewalk.com`
3. Add the CNAME records shown by the script (for certificate validation)
4. Wait 5-30 minutes for certificate to be validated

#### 2.2 Add Domain Records

Once certificate is validated, add these records:

**For www subdomain:**
- Type: `CNAME`
- Host: `www`
- Answer: `YOUR_CLOUDFRONT_DOMAIN.cloudfront.net` (from script output)
- TTL: `600`

**For root domain (choose one option):**

**Option A** - If Porkbun supports ALIAS records:
- Type: `ALIAS`
- Host: `@` (or leave empty)
- Answer: `YOUR_CLOUDFRONT_DOMAIN.cloudfront.net`
- TTL: `600`

**Option B** - If ALIAS not supported (recommended):
- Use Porkbun's **URL Redirect** feature
- Redirect: `alkascakewalk.com` → `www.alkascakewalk.com`
- Type: `301 Permanent`

---

### Step 3: Update CORS Settings

After your domain is working, update CORS to allow API requests:

```bash
cd infrastructure
./update-cors-for-domain.sh
```

Choose **Option 1** (Update Lambda code) and follow the instructions.

---

## Verification

### Check DNS Propagation

```bash
# Check if DNS is resolving
dig alkascakewalk.com
dig www.alkascakewalk.com

# Should show CloudFront domain or redirect
```

### Test HTTPS

```bash
# Test root domain
curl -I https://alkascakewalk.com

# Test www subdomain
curl -I https://www.alkascakewalk.com

# Both should return 200 OK with valid SSL
```

### Browser Test

1. Visit `https://alkascakewalk.com`
2. Visit `https://www.alkascakewalk.com`
3. Check SSL certificate (should be valid, issued by Amazon)
4. Test admin login and image upload

---

## Timeline

| Step | Time Required |
|------|---------------|
| Run configuration script | 5-10 minutes |
| Certificate validation | 5-30 minutes |
| Add DNS records | 5 minutes |
| DNS propagation | 1-2 hours |
| Update CORS | 10 minutes |
| **Total** | **2-3 hours** |

---

## Troubleshooting

### Certificate Stuck in "Pending Validation"

**Problem:** Certificate not validating after 30 minutes

**Solution:**
1. Check DNS records in Porkbun are correct
2. Verify you removed the domain suffix (e.g., `_abc123` not `_abc123.alkascakewalk.com`)
3. Wait up to 1 hour
4. Check AWS ACM console for status

### Domain Not Resolving

**Problem:** `dig alkascakewalk.com` doesn't show CloudFront

**Solution:**
1. Wait for DNS propagation (up to 48 hours, usually 1-2 hours)
2. Clear DNS cache: `sudo dscacheutil -flushcache`
3. Check Porkbun DNS records are saved
4. Try from different network/device

### CORS Errors After Domain Change

**Problem:** API calls fail with CORS errors

**Solution:**
1. Run `./update-cors-for-domain.sh`
2. Update Lambda functions with new CORS config
3. Deploy via GitHub Actions
4. Clear browser cache

### SSL Certificate Error

**Problem:** Browser shows SSL warning

**Solution:**
1. Verify certificate is in **us-east-1** region
2. Check both domains are in certificate (root and www)
3. Wait for CloudFront distribution to deploy (5-15 minutes)
4. Clear browser cache

---

## Manual Alternative

If you prefer to configure manually without scripts:

### 1. Request SSL Certificate
- Go to [AWS ACM Console](https://console.aws.amazon.com/acm/home?region=us-east-1)
- Request certificate for `alkascakewalk.com` and `www.alkascakewalk.com`
- Use DNS validation
- Add CNAME records to Porkbun

### 2. Update CloudFront
- Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
- Edit your distribution
- Add alternate domain names (CNAMEs)
- Select your SSL certificate
- Save and deploy

### 3. Configure DNS
- Add CNAME record for `www` → CloudFront domain
- Add ALIAS or redirect for root domain

---

## Next Steps After Domain is Live

1. **Update GitHub Secrets** (if needed):
   ```
   REACT_APP_SITE_URL=https://alkascakewalk.com
   ```

2. **Update Social Links**:
   - Update any external links to use new domain
   - Update Google Search Console
   - Update Google Analytics

3. **Set up Email** (optional):
   - Configure email forwarding in Porkbun
   - Set up MX records if needed

4. **Monitor**:
   - Check CloudWatch logs
   - Monitor CloudFront metrics
   - Set up alerts for errors

---

## Support

For detailed information, see:
- **Full Guide**: `DOMAIN_SETUP_PORKBUN.md`
- **Porkbun DNS Help**: https://kb.porkbun.com/category/7-dns
- **AWS CloudFront Docs**: https://docs.aws.amazon.com/cloudfront/

---

## Summary Checklist

- [ ] Run `./configure-custom-domain.sh`
- [ ] Add certificate validation CNAME records to Porkbun
- [ ] Wait for certificate to be validated (check ACM console)
- [ ] Add domain CNAME/ALIAS records to Porkbun
- [ ] Wait for DNS propagation (1-2 hours)
- [ ] Run `./update-cors-for-domain.sh`
- [ ] Update Lambda functions with CORS config
- [ ] Deploy via GitHub Actions
- [ ] Test website at `https://alkascakewalk.com`
- [ ] Test admin login and upload functionality

---

**Estimated Total Time:** 2-3 hours (including waiting periods)

**Status:** Ready to start! 🚀
