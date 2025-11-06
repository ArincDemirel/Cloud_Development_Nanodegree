import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';
import { uploadToS3 } from './util/uploadImageToS3bucket.js';
import https from 'https';
import http from 'http';
import fs from 'fs';
import Jimp from 'jimp';
import axios from 'axios';
// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// Helper function to download image (with redirect support)
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    // Determine protocol
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const request = protocol.get(url, options, (response) => {
      // Handle redirects (301, 302, 303, 307, 308)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(filePath);
        
        // Resolve relative redirects
        let redirectUrl = response.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const baseUrl = new URL(url);
          redirectUrl = new URL(redirectUrl, baseUrl).href;
        }
        
        // Follow redirect
        return downloadImage(redirectUrl, filePath).then(resolve).catch(reject);
      }
      
      // Handle other non-200 status codes
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filePath);
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    
    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}

// GET /filteredimage?image_url={{URL}}
app.get("/filteredimage", async (req, res) => {
  try {
    const imageUrl = req.query.image_url;
    
    if (!imageUrl) {
      return res.status(400).send("Error: image_url query parameter is required");
    }

    try {
      new URL(imageUrl);
    } catch (error) {
      return res.status(400).send("Error: image_url must be a valid URL");
    }

    const filteredPath = await filterImageFromURL(imageUrl);

    res.sendFile(filteredPath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending filtered image");
      }
      deleteLocalFiles([filteredPath]);
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(422).send("Error: Unable to process image.");
  }
});

// POST /upload
// POST /upload
app.post("/upload", async (req, res) => {
  try {
    const image_url = req.body.image_url;
    
    if (!image_url) {
      return res.status(400).send("Error: image_url is required");
    }

    try {
      new URL(image_url);
    } catch (error) {
      return res.status(400).send("Error: image_url must be a valid URL");
    }

    // Fetch image using axios with responseType as buffer
    const response = await axios.get(image_url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Convert buffer to Jimp image for original
    const originalJimp = await Jimp.read(response.data);
    const originalPath = `/tmp/original.${Math.floor(Math.random() * 2000)}.jpg`;
    await originalJimp.writeAsync(originalPath);

    // Filter the image (uses axios internally)
    const filteredPath = await filterImageFromURL(image_url);

    // Upload original to S3 /images folder
    const originalS3Key = `images/${Date.now()}_original.jpg`;
    const originalS3Url = await uploadToS3(originalPath, originalS3Key);

    // Upload filtered to S3 /filtered_images folder
    const filteredS3Key = `filtered_images/${Date.now()}_filtered.jpg`;
    const filteredS3Url = await uploadToS3(filteredPath, filteredS3Key);

    // Clean up local files
    deleteLocalFiles([originalPath, filteredPath]);

    // Send response
    res.status(200).json({
      message: "Image uploaded and filtered successfully",
      originalImageUrl: originalS3Url,
      filteredImageUrl: filteredS3Url
    });

  } catch (error) {
    console.error("Error processing upload:", error);
    console.error("Error details:", error.message);
    res.status(500).send(`Error: Unable to process image. ${error.message}`);
  }
});

// Root Endpoint
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}} or POST /upload with {image_url: '...'}")
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});