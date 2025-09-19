const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure AWS SDK with environment variables
const REGION = process.env.AWS_REGION || 'ap-south-1';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cakewalkbucket2';
const s3 = new AWS.S3({ region: REGION, signatureVersion: 'v4' });

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the multipart form data
    const formData = parseMultipartFormData(event);
    
    // Validate the file
    const { file, metadata } = validateAndExtractData(formData);
    
    // Generate a unique filename
    const fileExt = path.extname(file.filename).toLowerCase();
    const key = `${uuidv4()}${fileExt}`;
    
    // Upload to S3
    const uploadParams = {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file.content,
      ContentType: file.contentType,
      Metadata: {
        ...JSON.parse(metadata),
        originalName: file.filename,
        uploadDate: new Date().toISOString()
      }
    };
    
    const uploadResult = await s3.upload(uploadParams).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: true,
        message: 'File uploaded successfully',
        data: {
          location: uploadResult.Location,
          key: uploadResult.Key,
          bucket: uploadResult.Bucket,
          metadata: uploadParams.Metadata
        }
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: false,
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

function parseMultipartFormData(event) {
  if (!event.isBase64Encoded || !event.body) {
    throw { statusCode: 400, message: 'Invalid request format' };
  }
  
  const boundary = event.headers['Content-Type'].split('boundary=')[1];
  if (!boundary) {
    throw { statusCode: 400, message: 'Invalid Content-Type header' };
  }
  
  const body = Buffer.from(event.body, 'base64').toString('binary');
  const parts = body.split(`--${boundary}`);
  
  const formData = {};
  
  for (const part of parts) {
    if (part.trim() === '--' || part.trim() === '') continue;
    
    const [headers, ...contentParts] = part.split('\r\n\r\n');
    const content = contentParts.join('\r\n\r\n').trim();
    
    const nameMatch = headers.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    
    const name = nameMatch[1];
    
    // Handle file upload
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    if (filenameMatch) {
      const contentType = headers.match(/Content-Type: ([^\r\n]+)/);
      formData[name] = {
        filename: filenameMatch[1],
        contentType: contentType ? contentType[1] : 'application/octet-stream',
        content: Buffer.from(content, 'binary')
      };
    } else {
      formData[name] = content;
    }
  }
  
  return formData;
}

function validateAndExtractData(formData) {
  // Check if required fields exist
  if (!formData.file) {
    throw { statusCode: 400, message: 'No file provided' };
  }
  
  // Validate file type
  if (!ALLOWED_TYPES.includes(formData.file.contentType)) {
    throw { statusCode: 400, message: `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}` };
  }
  
  // Validate file size
  if (formData.file.content.length > MAX_FILE_SIZE) {
    throw { statusCode: 400, message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }
  
  // Validate metadata
  let metadata = {};
  if (formData.metadata) {
    try {
      metadata = JSON.parse(formData.metadata);
    } catch (e) {
      console.warn('Invalid metadata format, using empty object');
    }
  }
  
  return {
    file: formData.file,
    metadata: JSON.stringify(metadata)
  };
}
