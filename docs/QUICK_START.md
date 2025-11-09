# Quick Start: Deploy Auth Lambda

**Simplified deployment using existing GitHub Secrets!**

---

## ✅ What Changed

We've simplified the deployment to **reuse your existing `AWS_ROLE_ARN`** secret instead of requiring separate role ARNs for each Lambda function.

---

## 🚀 Deploy in 3 Steps

### **Step 1: Add 2 GitHub Secrets** (2 minutes)

Go to: https://github.com/kuldipkumar/acw/settings/secrets/actions

Click **"New repository secret"** and add:

**Secret 1:**
- Name: `AUTH_FUNCTION_NAME`
- Value: `acw-auth-lambda`

**Secret 2:**
- Name: `ADMIN_PASSWORD_HASH`
- Value: `$2b$10$WmEUgRKfbeadii5vwWU2getFPswmr6fDSVnyu8v6DBO8KJ4WlKiX6`

**That's it!** No need to find role ARNs - we're reusing what you already have.

---

### **Step 2: Push Code** (Automatic deployment)

```bash
git add .
git commit -m "feat: add auth-lambda deployment"
git push origin main
```

**Monitor:** https://github.com/kuldipkumar/acw/actions

Wait for the "Deploy Backend Lambdas" workflow to complete (usually 2-3 minutes).

---

### **Step 3: Configure API Gateway** (5 minutes, one-time)

1. Go to **AWS Console** → **API Gateway**
2. Select your API
3. Add route: `POST /api/auth/login` → `acw-auth-lambda`
4. Enable CORS
5. Deploy API

**Detailed instructions:** See `API_GATEWAY_SETUP.md`

---

## ✅ Test It Works

Visit: https://www.alkascakewalk.com/admin

Password: `Alka@1612!`

---

## 📚 Need More Details?

- **GitHub Secrets:** `GITHUB_SECRETS_SETUP.md`
- **API Gateway:** `API_GATEWAY_SETUP.md`
- **Full Overview:** `DEPLOYMENT_SUMMARY.md`

---

## 🎯 Why This Approach?

✅ **Simpler** - Only 2 new secrets instead of 3
✅ **Reuses existing infrastructure** - No need to find role ARNs
✅ **Consistent** - Same deployment method as frontend
✅ **Automated** - Push code → auto-deploy

---

## ❓ FAQ

**Q: What if my Lambda functions need different IAM roles?**
A: You can optionally add `LAMBDA_EXECUTION_ROLE_ARN` secret. The workflow will use it if present, otherwise falls back to `AWS_ROLE_ARN`.

**Q: Do I need AWS CLI installed locally?**
A: No! Everything runs in GitHub Actions.

**Q: What if the deployment fails?**
A: Check GitHub Actions logs at https://github.com/kuldipkumar/acw/actions

**Q: How do I change the password later?**
A: Generate new hash with `node generate-password-hash.js "NewPassword"`, update `ADMIN_PASSWORD_HASH` secret, and push code.

---

**Ready?** Add those 2 secrets and push! 🚀
