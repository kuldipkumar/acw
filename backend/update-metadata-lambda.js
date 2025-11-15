const { S3Client, CopyObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cakewalkbucket2';
const REGION = process.env.AWS_REGION || 'ap-south-1';

const s3Client = new S3Client({ region: REGION });

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const imageId = event.pathParameters.id;
    const { title, description, category, tags, isLandingImage, showInCarousel } = JSON.parse(event.body);

    // If setting this image as landing image, unset all other images first
    if (isLandingImage === true) {
      const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
      const { Contents } = await s3Client.send(listCommand);
      
      if (Contents) {
        for (const item of Contents) {
          if (item.Key !== imageId) {
            try {
              const headCmd = new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key });
              const { Metadata: itemMetadata } = await s3Client.send(headCmd);
              
              // Only update if it was previously set as landing image
              if (itemMetadata && itemMetadata.islandingimage === 'true') {
                const updatedMetadata = {
                  ...itemMetadata,
                  islandingimage: 'false'
                };
                
                const copyCmd = new CopyObjectCommand({
                  Bucket: BUCKET_NAME,
                  CopySource: `${BUCKET_NAME}/${item.Key}`,
                  Key: item.Key,
                  Metadata: updatedMetadata,
                  MetadataDirective: 'REPLACE',
                });
                
                await s3Client.send(copyCmd);
              }
            } catch (err) {
              console.error(`Error updating ${item.Key}:`, err);
            }
          }
        }
      }
    }

    // Fetch existing metadata to preserve other fields
    const headCommand = new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: imageId });
    const { Metadata: existingMetadata } = await s3Client.send(headCommand);

    const newMetadata = {
      ...existingMetadata,
      title: title || existingMetadata.title || '',
      description: description || existingMetadata.description || '',
      category: category || existingMetadata.category || '',
      tags: tags ? (Array.isArray(tags) ? tags.join(',') : tags) : existingMetadata.tags || '',
      islandingimage: isLandingImage !== undefined ? String(isLandingImage) : existingMetadata.islandingimage || 'false',
      showincarousel: showInCarousel !== undefined ? String(showInCarousel) : existingMetadata.showincarousel || 'false',
    };

    const copyCommand = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${imageId}`,
      Key: imageId,
      Metadata: newMetadata,
      MetadataDirective: 'REPLACE',
    });

    await s3Client.send(copyCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Metadata updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating metadata:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Failed to update metadata', error: error.message }),
    };
  }
};
