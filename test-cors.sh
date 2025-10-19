#!/bin/bash

# CORS Testing Script for Auth Endpoint
# Usage: ./test-cors.sh YOUR_API_GATEWAY_URL

if [ -z "$1" ]; then
  echo "Usage: ./test-cors.sh YOUR_API_GATEWAY_URL"
  echo "Example: ./test-cors.sh https://abc123.execute-api.ap-south-1.amazonaws.com"
  exit 1
fi

API_URL="$1"
ORIGIN="https://www.alkascakewalk.com"

echo "=========================================="
echo "🔍 CORS Testing for Auth Endpoint"
echo "=========================================="
echo ""
echo "API URL: $API_URL"
echo "Origin: $ORIGIN"
echo ""

echo "=========================================="
echo "Test 1: OPTIONS Request (Preflight)"
echo "=========================================="
echo ""

OPTIONS_RESPONSE=$(curl -s -X OPTIONS "${API_URL}/api/auth/login" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i)

echo "$OPTIONS_RESPONSE"
echo ""

# Check for CORS headers
if echo "$OPTIONS_RESPONSE" | grep -qi "access-control-allow-origin"; then
  echo "✅ CORS headers found in OPTIONS response"
else
  echo "❌ CORS headers NOT found in OPTIONS response"
  echo "   This is the problem! API Gateway CORS is not configured."
fi

echo ""
echo "=========================================="
echo "Test 2: POST Request"
echo "=========================================="
echo ""

POST_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -d '{"password":"Alka@1612!"}' \
  -i)

echo "$POST_RESPONSE"
echo ""

# Check for CORS headers
if echo "$POST_RESPONSE" | grep -qi "access-control-allow-origin"; then
  echo "✅ CORS headers found in POST response"
else
  echo "❌ CORS headers NOT found in POST response"
  echo "   Lambda might not be returning CORS headers correctly."
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""

# Extract headers
ALLOW_ORIGIN=$(echo "$OPTIONS_RESPONSE" | grep -i "access-control-allow-origin" | cut -d: -f2- | tr -d '\r')
ALLOW_METHODS=$(echo "$OPTIONS_RESPONSE" | grep -i "access-control-allow-methods" | cut -d: -f2- | tr -d '\r')
ALLOW_HEADERS=$(echo "$OPTIONS_RESPONSE" | grep -i "access-control-allow-headers" | cut -d: -f2- | tr -d '\r')

if [ -n "$ALLOW_ORIGIN" ]; then
  echo "Access-Control-Allow-Origin:$ALLOW_ORIGIN"
else
  echo "❌ Access-Control-Allow-Origin: NOT SET"
fi

if [ -n "$ALLOW_METHODS" ]; then
  echo "Access-Control-Allow-Methods:$ALLOW_METHODS"
else
  echo "❌ Access-Control-Allow-Methods: NOT SET"
fi

if [ -n "$ALLOW_HEADERS" ]; then
  echo "Access-Control-Allow-Headers:$ALLOW_HEADERS"
else
  echo "❌ Access-Control-Allow-Headers: NOT SET"
fi

echo ""
echo "=========================================="
echo "Recommendations"
echo "=========================================="
echo ""

if [ -z "$ALLOW_ORIGIN" ]; then
  echo "🔧 Fix Required: Configure CORS in API Gateway"
  echo ""
  echo "Steps:"
  echo "1. Go to AWS API Gateway Console"
  echo "2. Select your API"
  echo "3. Click 'CORS' in the left sidebar"
  echo "4. Configure:"
  echo "   - Access-Control-Allow-Origin: *"
  echo "   - Access-Control-Allow-Methods: POST, OPTIONS"
  echo "   - Access-Control-Allow-Headers: Content-Type, Authorization"
  echo "5. Click 'Save'"
  echo "6. IMPORTANT: Deploy the API!"
  echo ""
else
  echo "✅ CORS appears to be configured correctly!"
  echo ""
  echo "If you're still seeing CORS errors in the browser:"
  echo "1. Clear browser cache"
  echo "2. Try in incognito mode"
  echo "3. Check that API Gateway is deployed"
  echo "4. Verify the frontend is using the correct API URL"
fi

echo ""
