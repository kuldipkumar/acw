# Domain Setup Cheat Sheet 📋

Quick reference for configuring `alkascakewalk.com` with CloudFront.

---

## 🚀 Quick Commands

### Run Configuration Script
```bash
cd infrastructure
./configure-custom-domain.sh
```

### Update CORS
```bash
cd infrastructure
./update-cors-for-domain.sh
```

### Check DNS
```bash
dig alkascakewalk.com
dig www.alkascakewalk.com
```

### Test HTTPS
```bash
curl -I https://alkascakewalk.com
curl -I https://www.alkascakewalk.com
```

### Clear DNS Cache (Mac)
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

---

## 📝 DNS Records to Add in Porkbun

### 1. Certificate Validation (from ACM)
```
Type: CNAME
Host: _abc123...  (remove .alkascakewalk.com)
Value: _xyz456.acm-validations.aws.
TTL: 600
```

### 2. WWW Subdomain
```
Type: CNAME
Host: www
Value: YOUR_CLOUDFRONT_DOMAIN.cloudfront.net
TTL: 600
```

### 3. Root Domain (Option A - ALIAS)
```
Type: ALIAS
Host: @ (or leave empty)
Value: YOUR_CLOUDFRONT_DOMAIN.cloudfront.net
TTL: 600
```

### 3. Root Domain (Option B - Redirect)
```
Use Porkbun's URL Redirect:
From: alkascakewalk.com
To: www.alkascakewalk.com
Type: 301 Permanent
```

---

## 🔗 Important Links

| Service | URL |
|---------|-----|
| Porkbun DNS | https://porkbun.com/account/domainsSpeedy |
| AWS ACM (us-east-1) | https://console.aws.amazon.com/acm/home?region=us-east-1 |
| AWS CloudFront | https://console.aws.amazon.com/cloudfront/ |
| GitHub Secrets | https://github.com/kuldipkumar/acw/settings/secrets/actions |

---

## ⏱️ Timeline

| Step | Time |
|------|------|
| Run AWS script | 10 min |
| Add DNS validation | 5 min |
| **Wait for cert** | **5-30 min** |
| Add domain DNS | 5 min |
| **Wait for DNS** | **1-2 hours** |
| Update CORS | 10 min |
| Deploy | 5 min |
| **Total** | **2-3 hours** |

---

## ✅ Checklist

- [ ] Run `./configure-custom-domain.sh`
- [ ] Add cert validation CNAME to Porkbun
- [ ] Wait for cert status = "Issued"
- [ ] Add www CNAME to Porkbun
- [ ] Add root domain ALIAS/redirect
- [ ] Wait for DNS propagation
- [ ] Run `./update-cors-for-domain.sh`
- [ ] Update Lambda functions
- [ ] Deploy via GitHub Actions
- [ ] Test: `https://alkascakewalk.com`
- [ ] Test: `https://www.alkascakewalk.com`
- [ ] Test admin login
- [ ] Test image upload

---

## 🐛 Quick Fixes

### Cert not validating?
```bash
# Check DNS record in Porkbun
# Remove domain suffix from Host field
# Wait 30 min, then check ACM console
```

### DNS not resolving?
```bash
# Wait 1-2 hours for propagation
sudo dscacheutil -flushcache
dig @8.8.8.8 alkascakewalk.com
```

### CORS errors?
```bash
# Update Lambda functions with new CORS code
# Redeploy via GitHub Actions
# Clear browser cache
```

### SSL error?
```bash
# Verify cert is in us-east-1
# Wait 15 min for CloudFront deploy
# Clear browser cache
```

---

## 📞 Where to Get Help

1. **Quick Start**: `DOMAIN_QUICK_START.md`
2. **Detailed Guide**: `DOMAIN_SETUP_PORKBUN.md`
3. **Architecture**: `DOMAIN_ARCHITECTURE.md`
4. **Full README**: `README_DOMAIN_SETUP.md`

---

## 🎯 Success = All Green

```bash
✅ dig alkascakewalk.com → CloudFront domain
✅ dig www.alkascakewalk.com → CloudFront domain
✅ curl -I https://alkascakewalk.com → 200 OK
✅ curl -I https://www.alkascakewalk.com → 200 OK
✅ Browser: Valid SSL certificate
✅ Website loads correctly
✅ Admin login works
✅ Image upload works
✅ No CORS errors
```

---

**Start here**: `README_DOMAIN_SETUP.md` 🚀
