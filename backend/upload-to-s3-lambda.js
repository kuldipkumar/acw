const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const parser = require('lambda-multipart-parser');

// --- Configuration ---
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cakewalkbucket2';
const REGION = process.env.AWS_REGION || 'ap-south-1';

// Create an S3 client using AWS SDK v3
const s3Client = new S3Client({ region: REGION });

exports.handler = async (event) => {
  // Define CORS headers to be used in all responses
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
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
    // Check for authorization token
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Unauthorized: No valid authentication token provided',
        }),
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Basic token validation (in production, verify JWT properly)
    if (!token || token.length < 10) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Unauthorized: Invalid token',
        }),
      };
    }

    console.log('Authentication successful, proceeding with upload');
    console.log('=== LAMBDA UPLOAD HANDLER START ===');
    console.log('Event received:', JSON.stringify(event, null, 2));
    console.log('Event headers:', JSON.stringify(event.headers, null, 2));
    console.log('Event body type:', typeof event.body);
    console.log('Event body length:', event.body ? event.body.length : 'null');
    console.log('Event isBase64Encoded:', event.isBase64Encoded);
    
    // Use the robust parser to handle the multipart/form-data
    console.log('Attempting to parse multipart data...');
    const result = await parser.parse(event);
    console.log('Parser result:', JSON.stringify(result, null, 2));

    if (!result.files || result.files.length === 0) {
      throw new Error('No file uploaded. Please ensure the file field is named \'image\'.');
    }

    const file = result.files[0];
    console.log('File found:', {
      filename: file.filename,
      contentType: file.contentType,
      size: file.content ? file.content.length : 'no content'
    });

    // Extract metadata from the form fields
    const { title, description, category, tags, isLandingImage, showInCarousel } = result;
    console.log('Extracted metadata:', { title, description, category, tags, isLandingImage, showInCarousel });

    // Generate a unique filename
    const fileExt = path.extname(file.filename).toLowerCase();
    const key = `${uuidv4()}${fileExt}`;
    console.log('Generated S3 key:', key);

    // Prepare metadata for S3
    const s3Metadata = {
      title: title || '',
      description: description || '',
      category: category || '',
      tags: tags || '',
      originalname: file.filename, // Note: S3 metadata keys are lowercased
      islandingimage: String(isLandingImage === 'true' || isLandingImage === true),
      showincarousel: String(showInCarousel === 'true' || showInCarousel === true),
    };
    console.log('S3 metadata prepared:', s3Metadata);

    // Upload to S3 using SDK v3
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.content, // The parser provides the file content as a buffer
      ContentType: file.contentType,
      Metadata: s3Metadata,
    });

    console.log('Uploading to S3...');
    await s3Client.send(putObjectCommand);
    console.log('S3 upload successful!');

    const fileLocation = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    console.log('=== LAMBDA UPLOAD HANDLER SUCCESS ===');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'File uploaded successfully!',
        location: fileLocation,
      }),
    };
  } catch (error) {
    console.error('=== LAMBDA UPLOAD HANDLER ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    return {
      statusCode: 500,
      headers, // IMPORTANT: Return CORS headers even on error
      body: JSON.stringify({
        success: false,
        message: error.message || 'An internal server error occurred.',
        errorType: error.constructor.name,
        timestamp: new Date().toISOString()
      }),
    };
  }
};
