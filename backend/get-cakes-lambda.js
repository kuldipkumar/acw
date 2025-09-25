// Import the S3 client and commands from AWS SDK v3 (CommonJS)
const { S3Client, ListObjectsV2Command, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// --- Configuration ---
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cakewalkbucket2'; // Prefer env var
const REGION = process.env.AWS_REGION || 'ap-south-1'; // Prefer env var

// Create an S3 client
const s3Client = new S3Client({ region: REGION });

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  try {
    console.log(`Fetching cakes from bucket: ${BUCKET_NAME}`);
    const client = new S3Client({ region: REGION });

    const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
    const { Contents = [] } = await client.send(listCommand);

    if (Contents.length === 0) {
      console.log('Bucket is empty, returning empty array.');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([]),
      };
    }

    const imagePromises = Contents.map(async (item) => {
      try {
        // Get signed URL for the image
        const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key }), { expiresIn: 3600 });
        
        // Get object metadata
        const headCommand = new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key });
        const headResponse = await client.send(headCommand);
        const metadata = headResponse.Metadata || {};
        
        console.log(`Metadata for ${item.Key}:`, metadata);
        
        return {
          id: item.Key,
          name: metadata.title || item.Key.split('.')[0].replace(/[-_]/g, ' '),
          description: metadata.description || 'A delicious, handcrafted cake.',
          category: metadata.category || 'general',
          tags: metadata.tags ? metadata.tags.split(',').map(tag => tag.trim()) : [],
          originalname: metadata.originalname || item.Key,
          alt: `Image of ${metadata.title || item.Key}`,
          src: url,
          lastModified: item.LastModified,
          size: item.Size,
        };
      } catch (error) {
        console.error(`Error processing ${item.Key}:`, error);
        // Fallback if metadata retrieval fails
        const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key }), { expiresIn: 3600 });
        return {
          id: item.Key,
          name: item.Key.split('.')[0].replace(/[-_]/g, ' '),
          description: 'A delicious, handcrafted cake.',
          category: 'general',
          tags: [],
          originalname: item.Key,
          alt: `Image of ${item.Key}`,
          src: url,
          lastModified: item.LastModified,
          size: item.Size,
        };
      }
    });

    const images = await Promise.all(imagePromises);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(images),
    };
  } catch (error) {
    console.error('--- LAMBDA ERROR ---', error);
    return {
      statusCode: 500,
      headers, // Ensure CORS headers are sent even on error
      body: JSON.stringify({ message: 'Failed to fetch cakes.', error: error.message }),
    };
  }
};
