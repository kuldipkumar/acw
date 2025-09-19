require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS with environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const s3 = new AWS.S3();

async function testS3Access() {
  try {
    console.log('Testing AWS S3 access...');
    
    // List buckets to test basic S3 access
    console.log('Listing S3 buckets...');
    const { Buckets } = await s3.listBuckets().promise();
    
    console.log('\n✅ Successfully connected to AWS S3');
    console.log('\nAvailable buckets:');
    Buckets.forEach(bucket => {
      console.log(`- ${bucket.Name} (Created: ${bucket.CreationDate})`);
    });
    
    // Test specific bucket access if specified
    const testBucket = process.env.S3_BUCKET_NAME;
    if (testBucket) {
      console.log(`\nTesting access to bucket: ${testBucket}`);
      try {
        const params = {
          Bucket: testBucket,
          MaxKeys: 1
        };
        await s3.listObjectsV2(params).promise();
        console.log(`✅ Successfully accessed bucket: ${testBucket}`);
      } catch (bucketError) {
        console.error(`❌ Error accessing bucket ${testBucket}:`, bucketError.message);
        console.log('Note: You might need to check the bucket name or permissions');
      }
    }
    
  } catch (error) {
    console.error('❌ AWS Credential Test Failed');
    console.error('Error:', error.message);
    
    if (error.code === 'CredentialsError') {
      console.log('\n🔑 Authentication failed. Please check:');
      console.log('1. AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct');
      console.log('2. The IAM user has the necessary permissions');
      console.log('3. The AWS region is correct');
    }
    
    process.exit(1);
  }
}

// Run the test
testS3Access();
