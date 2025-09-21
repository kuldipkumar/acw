// Import the S3 client and commands from AWS SDK v3 (CommonJS)
const { S3Client, ListObjectsV2Command, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// --- Configuration ---
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cakewalkbucket2'; // Prefer env var
const REGION = process.env.AWS_REGION || 'ap-south-1'; // Prefer env var

// Create an S3 client
const s3Client = new S3Client({ region: REGION });

exports.handler = async (event) => {
  console.log('--- Invoking get-cakes-lambda ---');
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log(`Target S3 Bucket: ${BUCKET_NAME}`);

  if (!BUCKET_NAME) {
    console.error('Error: S3_BUCKET_NAME environment variable is not set.');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Server configuration error: Bucket name missing.' }),
    };
  }

  console.log('S3 client initialized.');

  try {
    console.log('Attempting to list objects from bucket...');
    const listObjectsParams = { Bucket: BUCKET_NAME };
    const listObjectsResult = await s3Client.send(new ListObjectsV2Command(listObjectsParams));
    console.log(`Found ${listObjectsResult.Contents.length} objects in the bucket.`);

    if (!listObjectsResult.Contents || listObjectsResult.Contents.length === 0) {
      console.log('No objects found in the bucket.');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([]),
      };
    }

    console.log('Generating pre-signed URLs for each object...');
    const cakeDataPromises = listObjectsResult.Contents.map(async (item) => {
      console.log(`- Generating URL for: ${item.Key}`);
      
      // Generate a pre-signed URL for private object access (default 1 hour)
      const signedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key }),
        { expiresIn: 3600 }
      );

      // SIMPLIFIED: Construct a basic object with just the URL
      return {
        id: item.Key,
        src: signedUrl,
      };
    });

    // Wait for all metadata fetches to complete
    const cakes = await Promise.all(cakeDataPromises);

    // 4. Return the data in the required format for API Gateway
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin (adjust for production)
      },
      body: JSON.stringify(cakes),
    };
  } catch (error) {
    console.error('Error fetching data from S3:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to fetch cake data.' }),
    };
  }
};
