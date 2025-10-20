# Domain Setup for alkascakewalk.com 🚀

Welcome! This guide will help you configure your Porkbun domain `alkascakewalk.com` with your existing CloudFront deployment.

---

## 📚 Documentation Overview

We've created comprehensive documentation to help you through the process:

### Quick Start (Recommended)
**[DOMAIN_QUICK_START.md](DOMAIN_QUICK_START.md)** - Start here!
- Simplified 3-step process
- Automated scripts
- Timeline and checklist
- Perfect for getting started quickly

### Detailed Guide
**[DOMAIN_SETUP_PORKBUN.md](DOMAIN_SETUP_PORKBUN.md)** - Complete reference
- Step-by-step instructions
- Manual configuration options
- Troubleshooting guide
- DNS configuration details

### Architecture
**[DOMAIN_ARCHITECTURE.md](DOMAIN_ARCHITECTURE.md)** - Technical deep dive
- Visual diagrams
- Request flow
- Security layers
- Performance details

---

## 🎯 What You'll Achieve

After completing this setup:
- ✅ Your website will be accessible at `https://alkascakewalk.com`
- ✅ Professional SSL certificate (free from AWS)
- ✅ Fast global delivery via CloudFront CDN
- ✅ Automatic HTTPS redirect
- ✅ No additional costs

---

## ⚡ Quick Start (3 Steps)

### Step 1: Configure AWS (10 minutes)
```bash
cd infrastructure
./configure-custom-domain.sh
```
This script will:
- Request SSL certificate
- Update CloudFront distribution
- Show you DNS records to add

### Step 2: Configure Porkbun DNS (5 minutes + waiting)
1. Add certificate validation CNAME records
2. Wait for certificate validation (5-30 minutes)
3. Add domain CNAME/ALIAS records
4. Wait for DNS propagation (1-2 hours)

### Step 3: Update CORS (10 minutes)
```bash
cd infrastructure
./update-cors-for-domain.sh
```
Choose Option 1 and follow instructions to update Lambda functions.

---

## 📋 Prerequisites

Before you start, make sure you have:

- [x] Domain `alkascakewalk.com` purchased from Porkbun
- [x] Access to Porkbun DNS management
- [x] AWS CLI configured with credentials
- [x] CloudFront distribution already deployed
- [x] GitHub repository access (for deploying CORS updates)

---

## 🛠️ Available Scripts

### 1. Configure Custom Domain
**Location**: `infrastructure/configure-custom-domain.sh`

**What it does**:
- Finds your CloudFront distribution
- Requests SSL certificate in ACM
- Provides DNS validation records
- Updates CloudFront with custom domain
- Shows DNS records to add to Porkbun

**Usage**:
```bash
cd infrastructure
./configure-custom-domain.sh
```

### 2. Update CORS Settings
**Location**: `infrastructure/update-cors-for-domain.sh`

**What it does**:
- Creates CORS configuration module
- Provides instructions to update Lambda functions
- Shows testing commands

**Usage**:
```bash
cd infrastructure
./update-cors-for-domain.sh
```

---

## 📊 Timeline

| Task | Duration | Can Work in Parallel? |
|------|----------|----------------------|
| Run AWS configuration script | 10 min | - |
| Add DNS validation records | 5 min | - |
| **Wait for certificate validation** | 5-30 min | ✅ Yes, take a break! |
| Add domain DNS records | 5 min | - |
| **Wait for DNS propagation** | 1-2 hours | ✅ Yes, work on CORS |
| Update CORS settings | 10 min | ✅ Can do while waiting |
| Deploy CORS updates | 5 min | - |
| Test website | 10 min | - |
| **Total active time** | ~45 min | |
| **Total elapsed time** | 2-3 hours | |

---

## ✅ Verification Checklist

Use this checklist to track your progress:

### AWS Configuration
- [ ] CloudFront distribution ID identified
- [ ] SSL certificate requested in ACM (us-east-1)
- [ ] Certificate validation DNS records obtained
- [ ] CloudFront distribution updated with custom domain

### Porkbun DNS Configuration
- [ ] Certificate validation CNAME records added
- [ ] Certificate status changed to "Issued" in ACM
- [ ] WWW subdomain CNAME record added
- [ ] Root domain ALIAS/redirect configured

### CORS Updates
- [ ] CORS configuration module created
- [ ] Lambda functions updated with new CORS code
- [ ] Changes committed to GitHub
- [ ] GitHub Actions deployment successful

### Testing
- [ ] DNS resolves correctly: `dig alkascakewalk.com`
- [ ] DNS resolves correctly: `dig www.alkascakewalk.com`
- [ ] HTTPS works: `https://alkascakewalk.com`
- [ ] HTTPS works: `https://www.alkascakewalk.com`
- [ ] SSL certificate is valid (check in browser)
- [ ] Website loads correctly
- [ ] Admin login works
- [ ] Image upload works
- [ ] No CORS errors in browser console

---

## 🔍 Testing Commands

### Check DNS Resolution
```bash
# Check root domain
dig alkascakewalk.com

# Check www subdomain
dig www.alkascakewalk.com

# Check from Google DNS
dig @8.8.8.8 alkascakewalk.com

# Check from Cloudflare DNS
dig @1.1.1.1 www.alkascakewalk.com
```

### Test HTTPS
```bash
# Test root domain
curl -I https://alkascakewalk.com

# Test www subdomain
curl -I https://www.alkascakewalk.com

# Test SSL certificate
openssl s_client -connect alkascakewalk.com:443 -servername alkascakewalk.com
```

### Test CORS
```bash
# Replace YOUR_API_URL with your actual API Gateway URL
curl -H "Origin: https://alkascakewalk.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     -I \
     https://YOUR_API_URL/api/cakes
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Certificate Stuck in "Pending Validation"
**Symptoms**: Certificate stays in pending state for >30 minutes

**Solutions**:
- Verify DNS records are correct in Porkbun
- Check you removed domain suffix from CNAME name
- Wait up to 1 hour
- Try removing and re-adding DNS records

#### 2. Domain Not Resolving
**Symptoms**: `dig` doesn't show CloudFront domain

**Solutions**:
- Wait for DNS propagation (up to 48 hours)
- Clear local DNS cache: `sudo dscacheutil -flushcache`
- Check DNS records are saved in Porkbun
- Try from different network/device

#### 3. CORS Errors
**Symptoms**: API calls fail with CORS errors in browser console

**Solutions**:
- Verify Lambda functions have updated CORS code
- Check API Gateway CORS settings
- Ensure origin matches exactly (https, no trailing slash)
- Clear browser cache

#### 4. SSL Certificate Error
**Symptoms**: Browser shows SSL warning

**Solutions**:
- Verify certificate is in us-east-1 region
- Check both domains are in certificate
- Wait for CloudFront to fully deploy (5-15 min)
- Clear browser cache

---

## 📞 Getting Help

### AWS Console Links
- **ACM Certificates**: https://console.aws.amazon.com/acm/home?region=us-east-1
- **CloudFront Distributions**: https://console.aws.amazon.com/cloudfront/
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/

### Porkbun Links
- **DNS Management**: https://porkbun.com/account/domainsSpeedy
- **Porkbun DNS Help**: https://kb.porkbun.com/category/7-dns

### AWS Documentation
- **CloudFront Custom Domains**: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html
- **ACM Validation**: https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html

---

## 🎓 Learning Resources

### Understanding the Stack
1. **DNS Basics**: How domain names work
2. **SSL/TLS**: How HTTPS certificates work
3. **CDN**: How CloudFront delivers content globally
4. **CORS**: Why browsers need CORS headers

### Recommended Reading
- [How DNS Works](https://howdns.works/)
- [How HTTPS Works](https://howhttps.works/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

---

## 🔄 Maintenance

### Regular Tasks

#### Certificate Renewal
- **Frequency**: Automatic (AWS handles this)
- **Action**: None required
- **Monitoring**: Check ACM console occasionally

#### DNS Updates
- **Frequency**: Only when changing infrastructure
- **Action**: Update DNS records in Porkbun
- **Tip**: Keep TTL low (600) for easier changes

#### CORS Updates
- **Frequency**: When adding new domains
- **Action**: Update Lambda functions and redeploy
- **Tip**: Keep allowed origins list in a config file

---

## 💰 Cost Breakdown

### One-Time Costs
- Domain registration: ~$10-15/year (Porkbun)
- Setup time: Free (your time)

### Ongoing AWS Costs
- ACM Certificate: **FREE** ✅
- CloudFront: ~$0.085/GB + $0.01/10,000 requests
- S3: ~$0.025/GB storage + $0.004/10,000 GET requests
- Lambda: Free tier covers most usage
- API Gateway: Free tier covers most usage

### Estimated Monthly Cost
- Low traffic (1,000 visitors/month): ~$1-2
- Medium traffic (10,000 visitors/month): ~$5-10
- High traffic (100,000 visitors/month): ~$20-30

**Note**: Custom domain adds NO additional AWS costs!

---

## 🚀 Next Steps After Domain is Live

### Immediate
1. Test all functionality thoroughly
2. Update any external links to use new domain
3. Share new URL with stakeholders

### Short Term (1 week)
1. Set up Google Search Console with new domain
2. Update Google Analytics (if using)
3. Update social media profiles
4. Set up email forwarding (optional)

### Long Term (1 month)
1. Monitor CloudWatch metrics
2. Optimize cache hit ratio
3. Consider adding WAF for security
4. Set up monitoring alerts

---

## 📝 Notes

### Important Reminders
- Always use **us-east-1** region for ACM certificates (CloudFront requirement)
- DNS propagation can take up to 48 hours (usually 1-2 hours)
- Keep your Porkbun account secure (enable 2FA)
- Document any custom configurations you make

### Best Practices
- Use HTTPS everywhere (CloudFront handles this)
- Keep DNS TTL reasonable (600 seconds is good)
- Test in incognito/private browsing to avoid cache issues
- Keep backups of DNS configurations

---

## 🎉 Success Criteria

Your domain setup is complete when:

- ✅ `https://alkascakewalk.com` loads your website
- ✅ `https://www.alkascakewalk.com` loads your website
- ✅ SSL certificate shows as valid in browser
- ✅ Admin login works
- ✅ Image upload works
- ✅ No CORS errors in console
- ✅ DNS resolves correctly from multiple locations

---

## 📧 Support

If you need help:

1. **Check troubleshooting section** in this guide
2. **Review detailed documentation** in DOMAIN_SETUP_PORKBUN.md
3. **Check AWS console** for error messages
4. **Review CloudWatch logs** for Lambda/API Gateway errors
5. **Test with curl commands** to isolate issues

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| Quick Start Guide | [DOMAIN_QUICK_START.md](DOMAIN_QUICK_START.md) |
| Detailed Setup Guide | [DOMAIN_SETUP_PORKBUN.md](DOMAIN_SETUP_PORKBUN.md) |
| Architecture Diagrams | [DOMAIN_ARCHITECTURE.md](DOMAIN_ARCHITECTURE.md) |
| Porkbun DNS | https://porkbun.com/account/domainsSpeedy |
| AWS ACM Console | https://console.aws.amazon.com/acm/home?region=us-east-1 |
| AWS CloudFront Console | https://console.aws.amazon.com/cloudfront/ |

---

**Ready to get started?** 

👉 Begin with [DOMAIN_QUICK_START.md](DOMAIN_QUICK_START.md)

**Good luck! 🚀**
