// Import the S3 client and commands from AWS SDK v3 (CommonJS)
const { S3Client, ListObjectsV2Command, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// --- Configuration ---
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cakewalkbucket2'; // Prefer env var
const REGION = process.env.AWS_REGION || 'ap-south-1'; // Prefer env var

// Create an S3 client
const s3Client = new S3Client({ region: REGION });

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Allow requests from any origin
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
      const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key }), { expiresIn: 3600 });
      return {
        id: item.Key,
        name: item.Key.split('.')[0].replace(/[-_]/g, ' '),
        description: 'A delicious, handcrafted cake.',
        alt: `Image of ${item.Key}`,
        src: url,
      };
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
