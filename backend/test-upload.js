// Test script for the upload-to-s3-lambda function
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Test configuration
const TEST_IMAGE = path.join(__dirname, 'test-image.jpg'); // Path to a test image
const API_URL = 'YOUR_API_GATEWAY_URL/upload'; // Replace with your API Gateway URL

async function testUpload() {
  try {
    // Check if test image exists
    if (!fs.existsSync(TEST_IMAGE)) {
      console.error(`Test image not found at: ${TEST_IMAGE}`);
      console.log('Please create a test image or update the TEST_IMAGE path.');
      return;
    }

    console.log('Starting upload test...');
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(TEST_IMAGE));
    form.append('bucket', 'your-s3-bucket-name'); // Replace with your S3 bucket name
    form.append('metadata', JSON.stringify({
      title: 'Test Upload',
      description: 'This is a test upload',
      category: 'test',
      tags: 'test,upload,image'
    }));

    // Send request
    const response = await fetch(API_URL, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Upload successful!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.error('Upload failed:', result);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testUpload();
