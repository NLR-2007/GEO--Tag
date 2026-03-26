const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GeoTag Camera API is running' });
});

/**
 * Helper to generate SVG text for overlay
 */
const createTextSvg = (text, width, height, background = 'rgba(0, 0, 0, 0.5)') => {
  return `
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" fill="${background}" rx="8" ry="8" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="white">
        ${text}
      </text>
    </svg>
  `;
};

/**
 * Process Image Endpoint (Backend variant of overlay)
 * We will do most of the overlay processing on the backend if requested
 * via this endpoint. The frontend Canvas will be the primary method.
 */
app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const { latitude, longitude, address, date } = req.body;

    // We'll add a simple overlay as an example of backend processing
    // using sharp composite feature

    const imageBuffer = req.file.buffer;
    const metadata = await sharp(imageBuffer).metadata();
    
    // Create an overlay text block
    const overlayText = `Lat: ${latitude || 'N/A'}, Lng: ${longitude || 'N/A'} | ${address || 'Local'} | ${date || new Date().toLocaleString()}`;
    const svgOverlay = createTextSvg(overlayText, Math.min(metadata.width, 1000), 60);

    const processedImageBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          gravity: 'south', // position at the bottom
          blend: 'over'
        }
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    // Send the processed image back
    res.set('Content-Type', 'image/jpeg');
    res.end(processedImageBuffer);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
