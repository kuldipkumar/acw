export const uploadToS3 = async (formData, authToken) => {
  try {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const headers = {};
    
    // Add auth token if provided
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers,
      body: formData,
      // Note: Don't set Content-Type header when using FormData
      // The browser will set it automatically with the correct boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Helper function to get presigned URL for direct upload (if needed in the future)
export const getPresignedUrl = async (fileName, fileType, bucketName) => {
  try {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const response = await fetch(`${baseUrl}/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileType,
        bucketName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get presigned URL');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw error;
  }
};
