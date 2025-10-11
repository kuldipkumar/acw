const bcrypt = require('bcryptjs');

// --- Configuration ---
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Simple JWT-like token generation (for demo - use proper JWT in production)
const generateToken = () => {
  return Buffer.from(`admin:${Date.now()}:${Math.random()}`).toString('base64');
};

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    console.log('=== AUTH LAMBDA START ===');
    console.log('Event:', JSON.stringify(event, null, 2));

    // Parse request body
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (e) {
      throw new Error('Invalid request body');
    }

    const { password } = body;

    if (!password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Password is required',
        }),
      };
    }

    // Check if admin password hash is configured
    if (!ADMIN_PASSWORD_HASH) {
      console.error('ADMIN_PASSWORD_HASH not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Authentication not configured',
        }),
      };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValid) {
      console.log('Invalid password attempt');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid password',
        }),
      };
    }

    // Generate token
    const token = generateToken();

    console.log('Authentication successful');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        token,
      }),
    };
  } catch (error) {
    console.error('=== AUTH LAMBDA ERROR ===');
    console.error('Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Authentication failed',
      }),
    };
  }
};
