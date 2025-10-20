#!/bin/bash

# Script to help configure custom domain for CloudFront distribution
# This script will guide you through the process and provide the necessary information

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_NAME="alkascakewalk.com"
WWW_DOMAIN="www.alkascakewalk.com"
REGION="us-east-1"  # ACM certificates for CloudFront must be in us-east-1

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Custom Domain Configuration Helper${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Domain: ${GREEN}$DOMAIN_NAME${NC}"
echo -e "WWW Domain: ${GREEN}$WWW_DOMAIN${NC}"
echo ""

# Step 1: Get CloudFront Distribution Info
echo -e "${YELLOW}Step 1: Getting CloudFront Distribution Information${NC}"
echo "-------------------------------------------"

# Check if distribution ID is available
if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}Listing all CloudFront distributions...${NC}"
    DISTRIBUTIONS=$(aws cloudfront list-distributions \
        --query 'DistributionList.Items[*].[Id,DomainName,Comment,Status]' \
        --output table)
    
    echo "$DISTRIBUTIONS"
    echo ""
    echo -e "${YELLOW}Please enter your CloudFront Distribution ID:${NC}"
    read -r DISTRIBUTION_ID
else
    DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID
fi

# Get distribution domain name
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
    --id "$DISTRIBUTION_ID" \
    --query 'Distribution.DomainName' \
    --output text)

echo -e "${GREEN}✓ CloudFront Domain: $CLOUDFRONT_DOMAIN${NC}"
echo ""

# Step 2: Request SSL Certificate
echo -e "${YELLOW}Step 2: SSL Certificate Setup${NC}"
echo "-------------------------------------------"
echo -e "Checking for existing certificates in ${BLUE}us-east-1${NC}..."

EXISTING_CERTS=$(aws acm list-certificates \
    --region us-east-1 \
    --query "CertificateSummaryList[?DomainName=='$DOMAIN_NAME'].{Arn:CertificateArn,Status:Status}" \
    --output table)

if [ -n "$EXISTING_CERTS" ]; then
    echo -e "${GREEN}Found existing certificate(s):${NC}"
    echo "$EXISTING_CERTS"
    echo ""
    echo -e "${YELLOW}Do you want to use an existing certificate? (y/n)${NC}"
    read -r USE_EXISTING
    
    if [ "$USE_EXISTING" = "y" ]; then
        echo -e "${YELLOW}Enter the Certificate ARN:${NC}"
        read -r CERTIFICATE_ARN
    else
        REQUEST_NEW_CERT=true
    fi
else
    REQUEST_NEW_CERT=true
fi

if [ "$REQUEST_NEW_CERT" = true ]; then
    echo -e "${YELLOW}Requesting new SSL certificate...${NC}"
    
    CERT_REQUEST=$(aws acm request-certificate \
        --region us-east-1 \
        --domain-name "$DOMAIN_NAME" \
        --subject-alternative-names "$WWW_DOMAIN" \
        --validation-method DNS \
        --query 'CertificateArn' \
        --output text)
    
    CERTIFICATE_ARN=$CERT_REQUEST
    echo -e "${GREEN}✓ Certificate requested: $CERTIFICATE_ARN${NC}"
    echo ""
    
    # Wait a moment for AWS to generate validation records
    echo "Waiting for validation records to be generated..."
    sleep 5
    
    # Get DNS validation records
    echo -e "${YELLOW}DNS Validation Records:${NC}"
    echo "-------------------------------------------"
    
    VALIDATION_RECORDS=$(aws acm describe-certificate \
        --region us-east-1 \
        --certificate-arn "$CERTIFICATE_ARN" \
        --query 'Certificate.DomainValidationOptions[*].ResourceRecord' \
        --output table)
    
    echo "$VALIDATION_RECORDS"
    echo ""
    
    # Get detailed validation info
    aws acm describe-certificate \
        --region us-east-1 \
        --certificate-arn "$CERTIFICATE_ARN" \
        --query 'Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Type,ResourceRecord.Value]' \
        --output table
    
    echo ""
    echo -e "${RED}IMPORTANT: Add these CNAME records to Porkbun DNS${NC}"
    echo -e "${YELLOW}Instructions:${NC}"
    echo "1. Log in to Porkbun: https://porkbun.com/account/domainsSpeedy"
    echo "2. Click on 'DNS' for alkascakewalk.com"
    echo "3. Add CNAME records as shown above"
    echo "4. For 'Host', remove the domain part (e.g., _abc123.alkascakewalk.com → _abc123)"
    echo "5. Wait for validation (5-30 minutes)"
    echo ""
    echo -e "${YELLOW}Press Enter when you've added the DNS records...${NC}"
    read -r
    
    # Check certificate status
    echo "Checking certificate validation status..."
    CERT_STATUS="PENDING_VALIDATION"
    ATTEMPTS=0
    MAX_ATTEMPTS=60
    
    while [ "$CERT_STATUS" = "PENDING_VALIDATION" ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
        CERT_STATUS=$(aws acm describe-certificate \
            --region us-east-1 \
            --certificate-arn "$CERTIFICATE_ARN" \
            --query 'Certificate.Status' \
            --output text)
        
        if [ "$CERT_STATUS" = "ISSUED" ]; then
            echo -e "${GREEN}✓ Certificate validated and issued!${NC}"
            break
        elif [ "$CERT_STATUS" = "PENDING_VALIDATION" ]; then
            echo -e "${YELLOW}Status: $CERT_STATUS (attempt $((ATTEMPTS+1))/$MAX_ATTEMPTS)${NC}"
            sleep 30
            ATTEMPTS=$((ATTEMPTS+1))
        else
            echo -e "${RED}Certificate status: $CERT_STATUS${NC}"
            break
        fi
    done
    
    if [ "$CERT_STATUS" != "ISSUED" ]; then
        echo -e "${RED}Certificate not yet issued. Please check ACM console:${NC}"
        echo "https://console.aws.amazon.com/acm/home?region=us-east-1#/certificates/list"
        echo ""
        echo "Continue this script once the certificate is issued."
        exit 1
    fi
fi

echo ""

# Step 3: Update CloudFront Distribution
echo -e "${YELLOW}Step 3: Updating CloudFront Distribution${NC}"
echo "-------------------------------------------"

# Get current distribution config
echo "Fetching current distribution configuration..."
aws cloudfront get-distribution-config \
    --id "$DISTRIBUTION_ID" \
    > /tmp/cf-config-original.json

# Extract ETag
ETAG=$(jq -r '.ETag' /tmp/cf-config-original.json)

# Extract and modify distribution config
jq '.DistributionConfig' /tmp/cf-config-original.json > /tmp/cf-config.json

# Update the config with custom domain and certificate
jq --arg domain "$DOMAIN_NAME" \
   --arg www_domain "$WWW_DOMAIN" \
   --arg cert_arn "$CERTIFICATE_ARN" \
   '.Aliases.Quantity = 2 |
    .Aliases.Items = [$domain, $www_domain] |
    .ViewerCertificate.ACMCertificateArn = $cert_arn |
    .ViewerCertificate.SSLSupportMethod = "sni-only" |
    .ViewerCertificate.MinimumProtocolVersion = "TLSv1.2_2021" |
    .ViewerCertificate.Certificate = $cert_arn |
    .ViewerCertificate.CertificateSource = "acm" |
    del(.ViewerCertificate.CloudFrontDefaultCertificate)' \
    /tmp/cf-config.json > /tmp/cf-config-updated.json

echo -e "${YELLOW}Updating CloudFront distribution...${NC}"
UPDATE_RESULT=$(aws cloudfront update-distribution \
    --id "$DISTRIBUTION_ID" \
    --distribution-config file:///tmp/cf-config-updated.json \
    --if-match "$ETAG" \
    --query 'Distribution.{Id:Id,Status:Status,DomainName:DomainName}' \
    --output json)

echo -e "${GREEN}✓ CloudFront distribution updated!${NC}"
echo "$UPDATE_RESULT" | jq .
echo ""

echo -e "${YELLOW}Distribution is deploying... This takes 5-15 minutes.${NC}"
echo ""

# Step 4: DNS Configuration Instructions
echo -e "${YELLOW}Step 4: Configure DNS in Porkbun${NC}"
echo "-------------------------------------------"
echo -e "${RED}IMPORTANT: Add these DNS records to Porkbun${NC}"
echo ""
echo -e "${GREEN}Record 1 - WWW Subdomain (CNAME):${NC}"
echo "  Type: CNAME"
echo "  Host: www"
echo "  Answer: $CLOUDFRONT_DOMAIN"
echo "  TTL: 600"
echo ""
echo -e "${GREEN}Record 2 - Root Domain:${NC}"
echo "  ${YELLOW}Option A - If Porkbun supports ALIAS records:${NC}"
echo "    Type: ALIAS"
echo "    Host: @ (or leave empty)"
echo "    Answer: $CLOUDFRONT_DOMAIN"
echo "    TTL: 600"
echo ""
echo "  ${YELLOW}Option B - If ALIAS not supported:${NC}"
echo "    Use Porkbun's URL redirect feature:"
echo "    Redirect alkascakewalk.com → www.alkascakewalk.com"
echo ""
echo -e "${BLUE}Instructions:${NC}"
echo "1. Log in to Porkbun: https://porkbun.com/account/domainsSpeedy"
echo "2. Click on 'DNS' for alkascakewalk.com"
echo "3. Add the records as shown above"
echo "4. Save changes"
echo ""

# Step 5: Verification
echo -e "${YELLOW}Step 5: Verification Commands${NC}"
echo "-------------------------------------------"
echo "After DNS propagates (1-2 hours), run these commands:"
echo ""
echo "# Check DNS resolution:"
echo "dig $DOMAIN_NAME"
echo "dig $WWW_DOMAIN"
echo ""
echo "# Test HTTPS:"
echo "curl -I https://$DOMAIN_NAME"
echo "curl -I https://$WWW_DOMAIN"
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuration Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "CloudFront Distribution ID: ${BLUE}$DISTRIBUTION_ID${NC}"
echo -e "CloudFront Domain: ${BLUE}$CLOUDFRONT_DOMAIN${NC}"
echo -e "SSL Certificate ARN: ${BLUE}$CERTIFICATE_ARN${NC}"
echo -e "Custom Domains: ${BLUE}$DOMAIN_NAME, $WWW_DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. ✓ SSL Certificate requested/configured"
echo "2. ✓ CloudFront distribution updated"
echo "3. ⏳ Add DNS records in Porkbun (see above)"
echo "4. ⏳ Wait for DNS propagation (1-2 hours)"
echo "5. ⏳ Update CORS settings in Lambda functions"
echo "6. ⏳ Test the website"
echo ""
echo -e "${GREEN}Done! 🚀${NC}"
echo ""

# Clean up
rm -f /tmp/cf-config*.json

# Save configuration
cat > /tmp/domain-config-summary.txt <<EOF
Domain Configuration Summary
============================

Date: $(date)

CloudFront Distribution ID: $DISTRIBUTION_ID
CloudFront Domain: $CLOUDFRONT_DOMAIN
SSL Certificate ARN: $CERTIFICATE_ARN
Custom Domains: $DOMAIN_NAME, $WWW_DOMAIN

DNS Records to Add in Porkbun:
-------------------------------
1. CNAME Record:
   Host: www
   Answer: $CLOUDFRONT_DOMAIN
   TTL: 600

2. Root Domain (choose one):
   Option A - ALIAS Record:
     Host: @
     Answer: $CLOUDFRONT_DOMAIN
     TTL: 600
   
   Option B - URL Redirect:
     Redirect $DOMAIN_NAME → $WWW_DOMAIN

Verification Commands:
----------------------
dig $DOMAIN_NAME
dig $WWW_DOMAIN
curl -I https://$DOMAIN_NAME
curl -I https://$WWW_DOMAIN

EOF

echo -e "${BLUE}Configuration summary saved to: /tmp/domain-config-summary.txt${NC}"
