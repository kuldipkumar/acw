#!/bin/bash

# Script to create S3 bucket and CloudFront distribution for frontend hosting
# Run this script once to set up the infrastructure

set -e

# Configuration
REGION="ap-south-1"
FRONTEND_BUCKET_NAME="acw-frontend-$(date +%s)"  # Unique bucket name
BACKEND_API_URL="https://lcs5qocz3b.execute-api.ap-south-1.amazonaws.com/dev/api"

echo "Creating frontend infrastructure..."
echo "Region: $REGION"
echo "Frontend bucket: $FRONTEND_BUCKET_NAME"

# Create S3 bucket for frontend hosting
echo "Creating S3 bucket: $FRONTEND_BUCKET_NAME"
aws s3 mb s3://$FRONTEND_BUCKET_NAME --region $REGION

# Configure bucket for static website hosting
echo "Configuring bucket for static website hosting..."
aws s3 website s3://$FRONTEND_BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# Create bucket policy for public read access
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$FRONTEND_BUCKET_NAME/*"
    }
  ]
}
EOF

# Apply bucket policy
echo "Setting bucket policy for public access..."
aws s3api put-bucket-policy \
  --bucket $FRONTEND_BUCKET_NAME \
  --policy file:///tmp/bucket-policy.json

# Create CloudFront distribution
echo "Creating CloudFront distribution..."
cat > /tmp/cloudfront-config.json <<EOF
{
  "CallerReference": "acw-frontend-$(date +%s)",
  "Comment": "ACW Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$FRONTEND_BUCKET_NAME",
        "DomainName": "$FRONTEND_BUCKET_NAME.s3-website-$REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$FRONTEND_BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    }
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

# Create the distribution
DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution \
  --distribution-config file:///tmp/cloudfront-config.json \
  --query '{Id:Distribution.Id,DomainName:Distribution.DomainName}' \
  --output json)

DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Id')
DISTRIBUTION_DOMAIN=$(echo $DISTRIBUTION_OUTPUT | jq -r '.DomainName')

echo ""
echo "✅ Infrastructure created successfully!"
echo ""
echo "📋 Add these secrets to your GitHub repository:"
echo "   Go to: https://github.com/kuldipkumar/acw/settings/secrets/actions"
echo ""
echo "   FRONTEND_S3_BUCKET_NAME: $FRONTEND_BUCKET_NAME"
echo "   CLOUDFRONT_DISTRIBUTION_ID: $DISTRIBUTION_ID"
echo "   REACT_APP_API_BASE_URL: $BACKEND_API_URL"
echo ""
echo "🌐 Your website will be available at:"
echo "   S3 Website URL: http://$FRONTEND_BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "   CloudFront URL: https://$DISTRIBUTION_DOMAIN"
echo ""
echo "⏳ Note: CloudFront distribution takes 10-15 minutes to deploy globally"
echo ""

# Clean up temp files
rm -f /tmp/bucket-policy.json /tmp/cloudfront-config.json

echo "🚀 Ready to deploy! Push changes to trigger the GitHub Actions workflow."
