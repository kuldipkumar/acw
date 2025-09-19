require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1',
  logger: console
});

const s3 = new AWS.S3();

async function testS3Access() {
  try {
    console.log('1. Testing AWS credentials by listing buckets...');
    const { Buckets } = await s3.listBuckets().promise();
    console.log('✅ Successfully connected to AWS S3');
    console.log('Available buckets:');
    Buckets.forEach(bucket => {
      console.log(`- ${bucket.Name} (Created: ${bucket.CreationDate})`);
    });

    const bucketName = process.env.S3_BUCKET_NAME || 'cakewalkbucket2';
    console.log(`\n2. Testing access to bucket: ${bucketName}`);
    
    try {
      // Test bucket existence and permissions
      await s3.headBucket({ Bucket: bucketName }).promise();
      console.log(`✅ Bucket exists and is accessible`);
      
      // Test write permissions
      const testKey = `test-${Date.now()}.txt`;
      console.log(`\n3. Testing write permissions with test file: ${testKey}`);
      
      await s3.putObject({
        Bucket: bucketName,
        Key: testKey,
        Body: 'Test file content',
        ContentType: 'text/plain',
        Metadata: {
          test: 'true',
          timestamp: new Date().toISOString()
        }
      }).promise();
      
      console.log('✅ Successfully uploaded test file');
      
      // Clean up
      await s3.deleteObject({
        Bucket: bucketName,
        Key: testKey
      }).promise();
      console.log('✅ Cleaned up test file');
      
    } catch (bucketError) {
      console.error('❌ Error accessing bucket:', bucketError.message);
      if (bucketError.statusCode === 403) {
        console.error('Access Denied. Please check:');
        console.error('1. The IAM user has s3:ListBucket permission');
        console.error('2. The IAM user has s3:PutObject permission');
        console.error('3. The bucket policy allows these actions');
      } else if (bucketError.statusCode === 404) {
        console.error('Bucket does not exist. Please check the bucket name.');
      }
      process.exit(1);
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

testS3Access();
