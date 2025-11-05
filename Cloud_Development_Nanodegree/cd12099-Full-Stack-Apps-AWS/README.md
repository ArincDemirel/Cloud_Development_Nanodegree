# Full Stack Apps on AWS Project

## Overview

This project is a Node.js image filtering service deployed on AWS Elastic Beanstalk. The application processes images by converting them to greyscale and resizing them to 256x256 pixels, designed to help with image processing for facial recognition software.

## Attribution

This project was **forked from and improved upon** the original `cd12099-Full-Stack-Apps-AWS` project from Udacity's Cloud Development Nanodegree program.

**Original Repository:** [cd12099-Full-Stack-Apps-AWS](https://github.com/udacity/cd12099-Full-Stack-Apps-AWS)

## Improvements Made

- ✅ Implemented `/filteredimage` endpoint with image validation and filtering
- ✅ Added `/upload` endpoint with S3 integration for image storage
- ✅ Enhanced error handling for image downloads with redirect support
- ✅ Integrated AWS S3 for storing original and filtered images
- ✅ Deployed to AWS Elastic Beanstalk with proper configuration
- ✅ Added comprehensive error handling and validation
- ✅ Improved image download function with redirect support and headers

## Project Description

You have been hired as a software engineer to develop an application that will help the FBI find missing people. The application will upload images to the FBI cloud database hosted in AWS. This will allow the FBI to run facial recognition software on the images to detect a match. You will be developing a NodeJS server and deploying it on AWS Elastic Beanstalk.

## Features

- **Image Filtering**: Convert images to greyscale and resize to 256x256 pixels
- **S3 Integration**: Upload original and filtered images to AWS S3
- **REST API**: Two main endpoints:
  - `GET /filteredimage?image_url={{URL}}` - Returns filtered image directly
  - `POST /upload` - Uploads original and filtered images to S3

## Getting Started

### Prerequisites

- Node.js 20 or higher
- AWS Account with Elastic Beanstalk and S3 access
- AWS CLI and EB CLI configured

### Installation

```bash
cd "project starter code"
npm install
```

### Running Locally

```bash
npm start
# Server runs on http://localhost:8082
```

### Deployment

```bash
# Navigate to project starter code directory
cd "project starter code"

# Initialize Elastic Beanstalk
eb init

# Create environment
eb create image-filter-api-env

# Deploy
eb deploy
```

## API Endpoints

### Root Endpoint
```
GET /
```
Returns usage instructions.

### Filtered Image Endpoint
```
GET /filteredimage?image_url={{URL}}
```
- Validates image URL
- Downloads and filters image (greyscale, 256x256)
- Returns filtered image file
- Cleans up temporary files

### Upload Endpoint
```
POST /upload
Body: { "image_url": "https://example.com/image.jpg" }
```
- Downloads original image
- Filters image
- Uploads both to S3:
  - Original: `s3://bucket/images/`
  - Filtered: `s3://bucket/filtered_images/`
- Returns S3 URLs in JSON response

## Testing

### Test Endpoints

```bash
# Set your EB URL
EB_URL="http://your-app.elasticbeanstalk.com"

# Test root endpoint
curl "$EB_URL/"

# Test filtered image
curl "$EB_URL/filteredimage?image_url=https://picsum.photos/400/400" -o test.jpg

# Test upload
curl -X POST "$EB_URL/upload" \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://picsum.photos/400/400"}'
```

### Test with Required Image

```bash
curl "$EB_URL/filteredimage?image_url=https://upload.wikimedia.org/wikipedia/commons/b/bd/Golden_tabby_and_white_kitten_n01.jpg" -o test_kitten.jpg
```

## Deployment

**Live URL:** http://image-filter-api-env.eba-z29euxpi.us-east-1.elasticbeanstalk.com

## Project Structure

```
.
├── project starter code/
│   ├── server.js              # Main Express server
│   ├── package.json           # Dependencies
│   ├── Procfile               # EB deployment config
│   └── util/
│       ├── util.js            # Image filtering utilities
│       └── uploadImageToS3bucket.js  # S3 upload utilities
├── deployment_screenshot.png   # Screenshot of EB dashboard
├── README.md
└── LICENSE.txt
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Jimp** - Image processing library
- **AWS SDK** - S3 integration
- **AWS Elastic Beanstalk** - Deployment platform
- **AWS S3** - Object storage

## License

[License](LICENSE.txt)

## Author

Arinc Demirel
