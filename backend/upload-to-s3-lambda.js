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
    'Access-Control-Allow-Origin': '*', // Be more specific in production
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Use the robust parser to handle the multipart/form-data
    const result = await parser.parse(event);

    if (!result.files || result.files.length === 0) {
      throw new Error('No file uploaded. Please ensure the file field is named \'image\'.');
    }

    const file = result.files[0];

    // Extract metadata from the form fields
    const { title, description, category, tags } = result;

    // Generate a unique filename
    const fileExt = path.extname(file.filename).toLowerCase();
    const key = `${uuidv4()}${fileExt}`;

    // Prepare metadata for S3
    const s3Metadata = {
      title: title || '',
      description: description || '',
      category: category || '',
      tags: tags || '',
      originalname: file.filename, // Note: S3 metadata keys are lowercased
    };

    // Upload to S3 using SDK v3
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.content, // The parser provides the file content as a buffer
      ContentType: file.contentType,
      Metadata: s3Metadata,
    });

    await s3Client.send(putObjectCommand);

    const fileLocation = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

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
    console.error('--- UPLOAD LAMBDA ERROR ---', error);
    return {
      statusCode: 500,
      headers, // IMPORTANT: Return CORS headers even on error
      body: JSON.stringify({
        success: false,
        message: error.message || 'An internal server error occurred.',
      }),
    };
  }
};
