require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');
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

// Upload endpoint - matches the Lambda function exactly
app.post('/api/cakes', upload.single('image'), async (req, res) => {
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
          description: 'Rich chocolate cake with ganache.',
          alt: 'Chocolate cake',
          src: 'https://via.placeholder.com/800x500.png?text=Chocolate+Cake'
        },
        {
          id: 'mock-2',
          name: 'Vanilla Dream',
          description: 'Classic vanilla sponge with cream.',
          alt: 'Vanilla cake',
          src: 'https://via.placeholder.com/800x500.png?text=Vanilla+Cake'
        },
        {
          id: 'mock-3',
          name: 'Red Velvet Bliss',
          description: 'Velvety layers with cream cheese frosting.',
          alt: 'Red velvet cake',
          src: 'https://via.placeholder.com/800x500.png?text=Red+Velvet+Cake'
        }
      ]);
    }

    // List objects
    const list = await s3.listObjectsV2({ Bucket: BUCKET_NAME }).promise();
    const contents = list.Contents || [];

    // For each object, fetch metadata and build a signed URL
    const results = await Promise.all(contents.map(async (item) => {
      const head = await s3.headObject({ Bucket: BUCKET_NAME, Key: item.Key }).promise();
      const metadata = head.Metadata || {};
      const signedUrl = s3.getSignedUrl('getObject', { Bucket: BUCKET_NAME, Key: item.Key, Expires: 3600 });

      return {
        id: item.Key,
        name: metadata.name || 'Unnamed Cake',
        description: metadata.description || '',
        alt: metadata.alt || 'Cake image',
        src: signedUrl,
      };
    }));

    res.json(results);
  } catch (error) {
    console.error('Error listing cakes:', error);
    res.status(500).json({ message: 'Failed to fetch cakes' });
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
