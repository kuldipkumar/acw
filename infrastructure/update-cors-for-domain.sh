#!/bin/bash

# Script to update CORS settings in Lambda functions for the new custom domain
# Run this after your domain is configured and working

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NEW_DOMAIN="https://alkascakewalk.com"
WWW_DOMAIN="https://www.alkascakewalk.com"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Update CORS for Custom Domain${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Adding domains to CORS:"
echo -e "  - ${GREEN}$NEW_DOMAIN${NC}"
echo -e "  - ${GREEN}$WWW_DOMAIN${NC}"
echo ""

# Lambda functions to update
LAMBDA_FUNCTIONS=(
    "acw-get-cakes-lambda"
    "acw-upload-lambda"
    "acw-auth-lambda"
)

echo -e "${YELLOW}This script will help you update CORS settings.${NC}"
echo ""
echo -e "${YELLOW}Option 1: Update Lambda code (Recommended)${NC}"
echo "  - Modify Lambda function code to support multiple origins"
echo "  - Deploy via GitHub Actions"
echo ""
echo -e "${YELLOW}Option 2: Update API Gateway CORS${NC}"
echo "  - Configure CORS at API Gateway level"
echo "  - Requires manual AWS Console configuration"
echo ""
echo -e "${YELLOW}Which option do you prefer? (1/2)${NC}"
read -r OPTION

if [ "$OPTION" = "1" ]; then
    echo ""
    echo -e "${BLUE}Creating updated Lambda function templates...${NC}"
    echo ""
    
    # Create a helper file with CORS configuration
    cat > ../backend/cors-config.js <<'EOF'
/**
 * CORS Configuration for ACW Lambda Functions
 * This module provides consistent CORS headers across all Lambda functions
 */

const ALLOWED_ORIGINS = [
    'https://alkascakewalk.com',
    'https://www.alkascakewalk.com',
    'http://localhost:3000', // For local development
];

/**
 * Get CORS headers for the given origin
 * @param {string} origin - The origin from the request
 * @returns {object} CORS headers
 */
function getCorsHeaders(origin) {
    // Check if origin is in allowed list
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) 
        ? origin 
        : ALLOWED_ORIGINS[0]; // Default to first allowed origin

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // 24 hours
    };
}

/**
 * Create a response with CORS headers
 * @param {number} statusCode - HTTP status code
 * @param {object} body - Response body
 * @param {string} origin - Request origin
 * @returns {object} Lambda response object
 */
function createCorsResponse(statusCode, body, origin) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
        },
        body: JSON.stringify(body),
    };
}

/**
 * Handle OPTIONS preflight request
 * @param {string} origin - Request origin
 * @returns {object} Lambda response object
 */
function handlePreflightRequest(origin) {
    return {
        statusCode: 200,
        headers: getCorsHeaders(origin),
        body: '',
    };
}

module.exports = {
    ALLOWED_ORIGINS,
    getCorsHeaders,
    createCorsResponse,
    handlePreflightRequest,
};
EOF

    echo -e "${GREEN}✓ Created cors-config.js${NC}"
    echo ""
    
    # Create example updated Lambda function
    cat > ../backend/example-lambda-with-cors.js <<'EOF'
/**
 * Example Lambda Function with CORS Support
 * This shows how to use the cors-config module in your Lambda functions
 */

const { createCorsResponse, handlePreflightRequest } = require('./cors-config');

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Get origin from request
    const origin = event.headers?.origin || event.headers?.Origin || '';
    
    // Handle OPTIONS preflight request
    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return handlePreflightRequest(origin);
    }
    
    try {
        // Your Lambda function logic here
        const result = {
            message: 'Success',
            data: {},
        };
        
        return createCorsResponse(200, result, origin);
    } catch (error) {
        console.error('Error:', error);
        return createCorsResponse(500, {
            error: 'Internal server error',
            message: error.message,
        }, origin);
    }
};
EOF

    echo -e "${GREEN}✓ Created example-lambda-with-cors.js${NC}"
    echo ""
    
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Review the cors-config.js file in backend/"
    echo "2. Update your Lambda functions to use the CORS helper:"
    echo ""
    echo -e "${BLUE}   Example for get-cakes-lambda.js:${NC}"
    echo "   const { createCorsResponse, handlePreflightRequest } = require('./cors-config');"
    echo "   // In handler:"
    echo "   const origin = event.headers?.origin || event.headers?.Origin || '';"
    echo "   if (event.httpMethod === 'OPTIONS') return handlePreflightRequest(origin);"
    echo "   // ... your logic ..."
    echo "   return createCorsResponse(200, result, origin);"
    echo ""
    echo "3. Commit and push changes to trigger GitHub Actions deployment:"
    echo "   git add backend/"
    echo "   git commit -m 'feat: add custom domain CORS support'"
    echo "   git push origin main"
    echo ""
    
elif [ "$OPTION" = "2" ]; then
    echo ""
    echo -e "${BLUE}API Gateway CORS Configuration${NC}"
    echo "-------------------------------------------"
    echo ""
    echo -e "${YELLOW}Manual Steps Required:${NC}"
    echo ""
    echo "1. Go to AWS API Gateway Console:"
    echo "   https://console.aws.amazon.com/apigateway/"
    echo ""
    echo "2. Select your API"
    echo ""
    echo "3. For each route (/api/cakes, /api/upload, /api/auth/login):"
    echo "   a. Click on the route"
    echo "   b. Click 'CORS' or 'Enable CORS'"
    echo "   c. Add allowed origins:"
    echo "      - $NEW_DOMAIN"
    echo "      - $WWW_DOMAIN"
    echo "   d. Set allowed headers:"
    echo "      - Content-Type"
    echo "      - Authorization"
    echo "      - X-Requested-With"
    echo "   e. Set allowed methods:"
    echo "      - GET"
    echo "      - POST"
    echo "      - PUT"
    echo "      - DELETE"
    echo "      - OPTIONS"
    echo "   f. Enable 'Access-Control-Allow-Credentials'"
    echo "   g. Click 'Save'"
    echo ""
    echo "4. Deploy the API:"
    echo "   a. Click 'Actions' → 'Deploy API'"
    echo "   b. Select your stage (e.g., 'dev' or 'prod')"
    echo "   c. Click 'Deploy'"
    echo ""
    echo "5. Test the API with your new domain"
    echo ""
else
    echo -e "${RED}Invalid option. Exiting.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing CORS Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "After updating CORS, test with these commands:"
echo ""
echo -e "${YELLOW}Test GET request:${NC}"
echo "curl -H 'Origin: $NEW_DOMAIN' \\"
echo "     -H 'Access-Control-Request-Method: GET' \\"
echo "     -H 'Access-Control-Request-Headers: Content-Type' \\"
echo "     -X OPTIONS \\"
echo "     -I \\"
echo "     https://YOUR_API_URL/api/cakes"
echo ""
echo -e "${YELLOW}Test POST request:${NC}"
echo "curl -H 'Origin: $NEW_DOMAIN' \\"
echo "     -H 'Access-Control-Request-Method: POST' \\"
echo "     -H 'Access-Control-Request-Headers: Content-Type,Authorization' \\"
echo "     -X OPTIONS \\"
echo "     -I \\"
echo "     https://YOUR_API_URL/api/auth/login"
echo ""
echo -e "${YELLOW}Expected response headers:${NC}"
echo "  Access-Control-Allow-Origin: $NEW_DOMAIN"
echo "  Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS"
echo "  Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With"
echo ""

echo -e "${GREEN}Done! 🚀${NC}"
