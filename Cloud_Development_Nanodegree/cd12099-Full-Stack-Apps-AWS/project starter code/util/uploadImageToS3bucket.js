import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const s3Client = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = 'elasticbeanstalk-us-east-1-021433698475';

export async function uploadToS3(filePath, s3Key) {
    try {
      const fileContent = fs.readFileSync(filePath);
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'image/jpeg'
      });
      
      await s3Client.send(command);
      
      // Return the S3 URL
      return `https://${BUCKET_NAME}.s3.us-east-1.amazonaws.com/${s3Key}`;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }