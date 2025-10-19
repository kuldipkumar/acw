#!/bin/bash

# AWS Lambda Deployment Script for ACW Backend
# This script deploys auth-lambda and updates upload-to-s3-lambda

set -e  # Exit on any error

echo "🚀 ACW Lambda Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found in backend directory${NC}"
    echo "Please create .env file with ADMIN_PASSWORD_HASH"
    exit 1
fi

# Load environment variables
source .env

# Check if ADMIN_PASSWORD_HASH is set
if [ -z "$ADMIN_PASSWORD_HASH" ]; then
    echo -e "${RED}❌ ADMIN_PASSWORD_HASH not found in .env${NC}"
    echo ""
    echo "Please run: node generate-password-hash.js YourPassword"
    echo "Then add the hash to your .env file"
    exit 1
fi

echo -e "${GREEN}✅ Password hash loaded from .env${NC}"

# Get AWS region (default to ap-south-1 if not set)
AWS_REGION=${AWS_REGION:-ap-south-1}
echo -e "${GREEN}✅ Using AWS region: $AWS_REGION${NC}"
echo ""

# Configuration
AUTH_LAMBDA_NAME="acw-auth-lambda"
UPLOAD_LAMBDA_NAME="acw-upload-lambda"
ROLE_NAME="acw-lambda-execution-role"

echo "📦 Step 1: Creating deployment packages..."
echo "=========================================="

# Create temp directory for deployment packages
mkdir -p .deploy
cd .deploy

# Package auth-lambda
echo "Packaging auth-lambda..."
mkdir -p auth-lambda
cp ../auth-lambda.js auth-lambda/index.js
cp ../package.json auth-lambda/
cd auth-lambda

# Install dependencies (only bcryptjs needed)
npm install bcryptjs --production --no-package-lock 2>/dev/null

# Create zip
zip -r ../auth-lambda.zip . > /dev/null
cd ..
echo -e "${GREEN}✅ auth-lambda packaged${NC}"

# Package upload-lambda
echo "Packaging upload-lambda..."
mkdir -p upload-lambda
cp ../upload-to-s3-lambda.js upload-lambda/index.js
cp ../package.json upload-lambda/
cd upload-lambda

# Install dependencies
npm install aws-sdk uuid lambda-multipart-parser --production --no-package-lock 2>/dev/null

# Create zip
zip -r ../upload-lambda.zip . > /dev/null
cd ..
echo -e "${GREEN}✅ upload-lambda packaged${NC}"
echo ""

# Go back to backend directory
cd ..

echo "🔍 Step 2: Checking existing Lambda functions..."
echo "================================================"

# Check if auth-lambda exists
AUTH_EXISTS=$(aws lambda get-function --function-name $AUTH_LAMBDA_NAME --region $AWS_REGION 2>/dev/null || echo "NOT_FOUND")

if [[ $AUTH_EXISTS == "NOT_FOUND" ]]; then
    echo -e "${YELLOW}⚠️  $AUTH_LAMBDA_NAME does not exist. Will create it.${NC}"
    
    # Check if IAM role exists
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || echo "NOT_FOUND")
    
    if [[ $ROLE_ARN == "NOT_FOUND" ]]; then
        echo -e "${YELLOW}⚠️  IAM role $ROLE_NAME does not exist. Creating...${NC}"
        
        # Create trust policy
        cat > .deploy/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
        
        # Create role
        ROLE_ARN=$(aws iam create-role \
            --role-name $ROLE_NAME \
            --assume-role-policy-document file://.deploy/trust-policy.json \
            --query 'Role.Arn' \
            --output text)
        
        # Attach basic execution policy
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        
        # Attach S3 access policy for upload lambda
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
        
        echo -e "${GREEN}✅ IAM role created: $ROLE_ARN${NC}"
        echo "⏳ Waiting 10 seconds for IAM role to propagate..."
        sleep 10
    else
        echo -e "${GREEN}✅ IAM role exists: $ROLE_ARN${NC}"
    fi
    
    echo ""
    echo "📤 Creating $AUTH_LAMBDA_NAME..."
    
    aws lambda create-function \
        --function-name $AUTH_LAMBDA_NAME \
        --runtime nodejs18.x \
        --role $ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://.deploy/auth-lambda.zip \
        --timeout 30 \
        --memory-size 256 \
        --region $AWS_REGION \
        --environment "Variables={ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH}" \
        > /dev/null
    
    echo -e "${GREEN}✅ $AUTH_LAMBDA_NAME created successfully${NC}"
else
    echo -e "${GREEN}✅ $AUTH_LAMBDA_NAME exists. Updating...${NC}"
    
    # Update function code
    aws lambda update-function-code \
        --function-name $AUTH_LAMBDA_NAME \
        --zip-file fileb://.deploy/auth-lambda.zip \
        --region $AWS_REGION \
        > /dev/null
    
    # Update environment variables
    aws lambda update-function-configuration \
        --function-name $AUTH_LAMBDA_NAME \
        --environment "Variables={ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH}" \
        --region $AWS_REGION \
        > /dev/null
    
    echo -e "${GREEN}✅ $AUTH_LAMBDA_NAME updated successfully${NC}"
fi

echo ""

# Check if upload-lambda exists
UPLOAD_EXISTS=$(aws lambda get-function --function-name $UPLOAD_LAMBDA_NAME --region $AWS_REGION 2>/dev/null || echo "NOT_FOUND")

if [[ $UPLOAD_EXISTS == "NOT_FOUND" ]]; then
    echo -e "${YELLOW}⚠️  $UPLOAD_LAMBDA_NAME does not exist.${NC}"
    echo -e "${YELLOW}Please create it manually or provide the correct function name.${NC}"
else
    echo -e "${GREEN}✅ $UPLOAD_LAMBDA_NAME exists. Updating...${NC}"
    
    # Update function code
    aws lambda update-function-code \
        --function-name $UPLOAD_LAMBDA_NAME \
        --zip-file fileb://.deploy/upload-lambda.zip \
        --region $AWS_REGION \
        > /dev/null
    
    echo -e "${GREEN}✅ $UPLOAD_LAMBDA_NAME updated successfully${NC}"
fi

echo ""
echo "🧹 Cleaning up deployment packages..."
rm -rf .deploy
echo -e "${GREEN}✅ Cleanup complete${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "1. Configure API Gateway routes:"
echo "   - POST /api/auth/login → $AUTH_LAMBDA_NAME"
echo "   - POST /api/upload → $UPLOAD_LAMBDA_NAME"
echo ""
echo "2. Enable CORS on both routes"
echo ""
echo "3. Deploy API Gateway"
echo ""
echo "4. Test the endpoints:"
echo "   curl -X POST https://your-api-url/api/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"password\":\"YourPassword\"}'"
echo ""
echo "✅ Lambda functions are ready!"
