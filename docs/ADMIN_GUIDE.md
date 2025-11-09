# Admin Interface for Alka's Cake Walk

This guide explains how to set up and use the admin interface for uploading images to S3 buckets.

## Prerequisites

1. Node.js (v14 or later)
2. npm or yarn
3. AWS Account with appropriate S3 permissions
4. AWS CLI configured with appropriate credentials

## Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in your Lambda function or `.env` file:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region (e.g., ap-south-1)
   ```

4. Deploy the Lambda function:
   - Create a new Lambda function in AWS Console
   - Upload the `upload-to-s3-lambda.js` file
   - Set the handler to `upload-to-s3-lambda.handler`
   - Set the timeout to at least 30 seconds
   - Add an API Gateway trigger
   - Note the API Gateway URL

## Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies if not already installed:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with your API URL:
   ```
   REACT_APP_API_URL=your_api_gateway_url
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Using the Admin Interface

1. Access the admin interface at `http://localhost:3000/admin`

2. Fill in the upload form:
   - Select the target S3 bucket
   - Choose an image file to upload
   - Add metadata (title, description, category, tags)
   - Click "Upload"

3. Monitor the upload status:
   - Success messages will appear in green
   - Error messages will appear in red

## Security Considerations

1. **For Development Only**: This implementation doesn't include authentication. For production, you should:
   - Implement user authentication
   - Secure the API Gateway with API keys or Cognito
   - Set up proper IAM roles and policies
   - Enable CORS only for your domain
   - Implement rate limiting

2. **S3 Bucket Policy**: Ensure your S3 bucket has the following permissions:
   - `s3:PutObject` for the Lambda execution role
   - Consider adding a bucket policy to restrict access

## Troubleshooting

1. **Upload Fails**:
   - Check browser console for errors
   - Verify CORS is properly configured on the API Gateway
   - Ensure the Lambda function has the correct permissions

2. **Images Not Displaying**:
   - Check if the S3 bucket policy allows public read access (if needed)
   - Verify the image URLs in the response

## Next Steps

1. Add user authentication
2. Implement image resizing before upload
3. Add image preview functionality
4. Implement batch uploads
5. Add progress indicators for large files
