// Import the S3 client and commands from AWS SDK v3 (CommonJS)
const { S3Client, ListObjectsV2Command, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// --- Configuration ---
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cakewalkbucket2'; // Prefer env var
const REGION = process.env.AWS_REGION || 'ap-south-1'; // Prefer env var

// Create an S3 client
const s3Client = new S3Client({ region: REGION });

exports.handler = async (event) => {
  // Note: We will generate pre-signed URLs instead of using the public bucket URL

  try {
    // 1. List all objects in the S3 bucket
    const listObjectsParams = { Bucket: BUCKET_NAME };
    const listObjectsResult = await s3Client.send(new ListObjectsV2Command(listObjectsParams));

    if (!listObjectsResult.Contents || listObjectsResult.Contents.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([]),
      };
    }

    // 2. For each object, get its metadata and a pre-signed URL
    const cakeDataPromises = listObjectsResult.Contents.map(async (item) => {
      const headObjectParams = { Bucket: BUCKET_NAME, Key: item.Key };
      const headObjectResult = await s3Client.send(new HeadObjectCommand(headObjectParams));

      const metadata = headObjectResult.Metadata;

      // Generate a pre-signed URL for private object access (default 1 hour)
      const signedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key }),
        { expiresIn: 3600 }
      );

      // 3. Construct the cake object with a pre-signed URL
      return {
        id: item.Key, // Use the file key as a unique ID
        name: metadata.name || 'Unnamed Cake',
        description: metadata.description || '',
        alt: metadata.alt || 'A beautiful cake',
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
