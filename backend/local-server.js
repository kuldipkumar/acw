require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Log environment variables for debugging
console.log('Environment Variables:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '*** (set)' : 'Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '*** (set)' : 'Not set');

// Configure AWS
const REGION = process.env.AWS_REGION || 'ap-south-1';
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cakewalkbucket2';

const HAS_AWS = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
if (!HAS_AWS) {
  console.warn('Warning: AWS credentials not found. Uploads will be disabled and cakes will use mock data.');
  console.warn('Provide AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in backend/.env for full functionality.');
}

if (HAS_AWS) {
  AWS.config.update({
    region: REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4'
  });
}

console.log(`Using S3 bucket: ${BUCKET_NAME} in region: ${REGION}`);

const s3 = HAS_AWS ? new AWS.S3() : null;

// Enable AWS request/response logging
if (HAS_AWS) {
  AWS.config.logger = console;
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided'
    });
  }

  // Basic token validation (in production, verify JWT properly)
  if (token.length < 10) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token'
    });
  }

  next();
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD_HASH not configured in .env');
      return res.status(500).json({
        success: false,
        message: 'Authentication not configured'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, adminPasswordHash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`admin:${Date.now()}:${Math.random()}`).toString('base64');

    res.json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

// Upload endpoint - now protected with authentication
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  console.log('Upload request received');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request file:', req.file ? 'File received' : 'No file received');

  try {
    if (!HAS_AWS) {
      return res.status(503).json({
        success: false,
        message: 'Uploads are disabled: missing AWS credentials on the server.'
      });
    }
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded. Please ensure the file field is named \'image\'.' 
      });
    }

    // Log file details
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Extract metadata from body - matches Lambda destructuring
    const { title, description, category, tags } = req.body;

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const key = `${uuidv4()}${fileExtension}`;

    // Prepare metadata for S3 - matches Lambda structure
    const s3Metadata = {
      title: title || '',
      description: description || '',
      category: category || '',
      tags: tags || '',
      originalname: req.file.originalname, // Note: S3 metadata keys are lowercased
    };

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: require('fs').createReadStream(req.file.path),
      ContentType: req.file.mimetype,
      Metadata: s3Metadata
    };

    console.log('Uploading to S3 with params:', JSON.stringify({
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      Metadata: params.Metadata
    }, null, 2));

    const uploadResult = await s3.upload(params).promise();
    console.log('Upload successful:', uploadResult.Location);
    
    // Clean up the temporary file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const fileLocation = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    // Match Lambda response format exactly
    res.json({
      success: true,
      message: 'File uploaded successfully!',
      location: fileLocation
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up the temporary file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'An internal server error occurred.'
    });
  }
});

// List cakes endpoint - returns objects from S3 with metadata and presigned URLs
app.get('/api/cakes', async (req, res) => {
  console.log('GET /api/cakes request received');
  try {
    // If AWS creds are not provided, return a small mock list to help local dev
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return res.json([
        {
          id: 'mock-1',
          name: 'Chocolate Delight',
          description: 'Rich chocolate cake with ganache and fresh berries.',
          category: 'chocolate',
          tags: ['chocolate', 'birthday', 'premium'],
          originalname: 'chocolate-delight.jpg',
          alt: 'Chocolate cake with ganache',
          src: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
          lastModified: new Date().toISOString(),
          size: 1024000
        },
        {
          id: 'mock-2',
          name: 'Vanilla Dream',
          description: 'Classic vanilla sponge with cream and seasonal fruits.',
          category: 'vanilla',
          tags: ['vanilla', 'anniversary', 'classic'],
          originalname: 'vanilla-dream.jpg',
          alt: 'Vanilla cake with cream',
          src: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=800&auto=format&fit=crop',
          lastModified: new Date().toISOString(),
          size: 956000
        },
        {
          id: 'mock-3',
          name: 'Red Velvet Bliss',
          description: 'Velvety layers with cream cheese frosting and elegant decoration.',
          category: 'specialty',
          tags: ['red-velvet', 'wedding', 'elegant'],
          originalname: 'red-velvet-bliss.jpg',
          alt: 'Red velvet cake with cream cheese frosting',
          src: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=800&auto=format&fit=crop',
          lastModified: new Date().toISOString(),
          size: 1200000
        },
        {
          id: 'mock-4',
          name: 'Strawberry Surprise',
          description: 'Fresh strawberry cake with whipped cream and berry compote.',
          category: 'fruit',
          tags: ['strawberry', 'fresh', 'summer'],
          originalname: 'strawberry-surprise.jpg',
          alt: 'Strawberry cake with fresh berries',
          src: 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?q=80&w=800&auto=format&fit=crop',
          lastModified: new Date().toISOString(),
          size: 890000
        }
      ]);
    }

    // List objects
    const list = await s3.listObjectsV2({ Bucket: BUCKET_NAME }).promise();
    const contents = list.Contents || [];

    // For each object, fetch metadata and build a signed URL - matches updated Lambda
    const results = await Promise.all(contents.map(async (item) => {
      try {
        const head = await s3.headObject({ Bucket: BUCKET_NAME, Key: item.Key }).promise();
        const metadata = head.Metadata || {};
        const signedUrl = s3.getSignedUrl('getObject', { Bucket: BUCKET_NAME, Key: item.Key, Expires: 3600 });

        console.log(`Metadata for ${item.Key}:`, metadata);

        return {
          id: item.Key,
          name: metadata.title || item.Key.split('.')[0].replace(/[-_]/g, ' '),
          description: metadata.description || 'A delicious, handcrafted cake.',
          category: metadata.category || 'general',
          tags: metadata.tags ? metadata.tags.split(',').map(tag => tag.trim()) : [],
          originalname: metadata.originalname || item.Key,
          alt: `Image of ${metadata.title || item.Key}`,
          src: signedUrl,
          url: signedUrl,
          lastModified: item.LastModified,
          size: item.Size,
          isLandingImage: metadata.islandingimage === 'true',
        };
      } catch (error) {
        console.error(`Error processing ${item.Key}:`, error);
        // Fallback if metadata retrieval fails
        const signedUrl = s3.getSignedUrl('getObject', { Bucket: BUCKET_NAME, Key: item.Key, Expires: 3600 });
        return {
          id: item.Key,
          name: item.Key.split('.')[0].replace(/[-_]/g, ' '),
          description: 'A delicious, handcrafted cake.',
          category: 'general',
          tags: [],
          originalname: item.Key,
          alt: `Image of ${item.Key}`,
          src: signedUrl,
          lastModified: item.LastModified,
          size: item.Size,
        };
      }
    }));

    res.json(results);
  } catch (error) {
    console.error('Error listing cakes:', error);
    res.status(500).json({ message: 'Failed to fetch cakes' });
  }
});

// Update cake metadata endpoint
app.put('/api/cakes/:id', authenticateToken, async (req, res) => {
  console.log(`PUT /api/cakes/${req.params.id} request received`);
  try {
    if (!HAS_AWS) {
      return res.status(503).json({
        success: false,
        message: 'Metadata updates are disabled: missing AWS credentials on the server.'
      });
    }

    const { title, description, category, tags, isLandingImage } = req.body;

    // First, get the existing metadata to preserve fields not being updated
    const headParams = {
      Bucket: BUCKET_NAME,
      Key: req.params.id,
    };
    const headObject = await s3.headObject(headParams).promise();
    const existingMetadata = headObject.Metadata || {};

    // If setting this image as landing image, we need to unset all other images first
    if (isLandingImage === true) {
      const list = await s3.listObjectsV2({ Bucket: BUCKET_NAME }).promise();
      const contents = list.Contents || [];
      
      // Unset isLandingImage for all other images
      for (const item of contents) {
        if (item.Key !== req.params.id) {
          try {
            const head = await s3.headObject({ Bucket: BUCKET_NAME, Key: item.Key }).promise();
            const itemMetadata = head.Metadata || {};
            
            // Only update if it was previously set as landing image
            if (itemMetadata.islandingimage === 'true') {
              const updatedMetadata = {
                ...itemMetadata,
                islandingimage: 'false'
              };
              
              await s3.copyObject({
                Bucket: BUCKET_NAME,
                CopySource: `${BUCKET_NAME}/${item.Key}`,
                Key: item.Key,
                Metadata: updatedMetadata,
                MetadataDirective: 'REPLACE',
                ContentType: head.ContentType
              }).promise();
            }
          } catch (err) {
            console.error(`Error updating ${item.Key}:`, err);
          }
        }
      }
    }

    // Prepare the new metadata
    const newMetadata = {
      ...existingMetadata,
      title: title !== undefined ? title : existingMetadata.title || '',
      description: description !== undefined ? description : existingMetadata.description || '',
      category: category !== undefined ? category : existingMetadata.category || '',
      tags: tags !== undefined ? (Array.isArray(tags) ? tags.join(',') : tags) : existingMetadata.tags || '',
      islandingimage: isLandingImage !== undefined ? String(isLandingImage) : existingMetadata.islandingimage || 'false',
    };

    // Copy the object to update its metadata
    const copyParams = {
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${req.params.id}`,
      Key: req.params.id,
      Metadata: newMetadata,
      MetadataDirective: 'REPLACE',
      ContentType: headObject.ContentType, // Preserve the content type
    };

    await s3.copyObject(copyParams).promise();

    res.json({ success: true, message: 'Metadata updated successfully' });

  } catch (error) {
    console.error(`Error updating metadata for ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to update metadata' });
  }
});

// Google Reviews endpoint - fetches latest reviews via Google Places Details API
app.get('/api/reviews', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID; // e.g., ChIJxxxxxxxxxxxxxxxx

    if (!apiKey || !placeId) {
      console.warn('Google Places API is not configured. Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID in backend/.env');
      return res.status(200).json({
        source: 'mock',
        reviews: [
          {
            id: 'mock-1',
            author: 'Happy Customer',
            profile_photo_url: '',
            rating: 5,
            relative_time_description: 'Recently',
            text: "Absolutely loved the cake! Beautifully crafted and tasted amazing.",
          }
        ]
      });
    }

    // Use Node's https to avoid extra deps
    const https = require('https');
    const querystring = require('querystring');
    const params = querystring.stringify({
      place_id: placeId,
      fields: 'reviews,rating,user_ratings_total',
      key: apiKey
    });

    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;

    await new Promise((resolve) => {
      https
        .get(url, (apiRes) => {
          let data = '';
          apiRes.on('data', (chunk) => (data += chunk));
          apiRes.on('end', () => {
            try {
              const parsed = JSON.parse(data || '{}');
              if (parsed.status !== 'OK') {
                console.error('Google Places API error:', parsed.status, parsed.error_message);
                res.status(502).json({ message: 'Failed to fetch reviews', status: parsed.status, error: parsed.error_message });
                return resolve();
              }
              const rawReviews = (parsed.result && parsed.result.reviews) || [];
              const reviews = rawReviews.map((r, idx) => ({
                id: `${r.author_name || 'user'}-${r.time || idx}`,
                author: r.author_name,
                profile_photo_url: r.profile_photo_url,
                rating: r.rating,
                relative_time_description: r.relative_time_description,
                text: r.text,
              }));
              res.json({
                source: 'google',
                total: parsed.result?.user_ratings_total || reviews.length,
                rating: parsed.result?.rating || null,
                reviews,
              });
              resolve();
            } catch (e) {
              console.error('Error parsing Google Places response:', e);
              res.status(500).json({ message: 'Error parsing reviews' });
              resolve();
            }
          });
        })
        .on('error', (err) => {
          console.error('HTTPS error fetching Google reviews:', err);
          res.status(502).json({ message: 'Failed to reach reviews service' });
          resolve();
        });
    });
  } catch (error) {
    console.error('Unexpected error in /api/reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Simple health check endpoint for quicker troubleshooting
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    bucket: BUCKET_NAME,
    region: REGION,
    awsCreds: {
      accessKeySet: !!process.env.AWS_ACCESS_KEY_ID,
      secretSet: !!process.env.AWS_SECRET_ACCESS_KEY
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Upload endpoint: http://localhost:${port}/api/upload`);
});
