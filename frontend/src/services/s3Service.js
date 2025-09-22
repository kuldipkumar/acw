export const uploadToS3 = async (formData) => {
  try {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const response = await fetch(`${baseUrl}/cakes`, {
      method: 'POST',
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
