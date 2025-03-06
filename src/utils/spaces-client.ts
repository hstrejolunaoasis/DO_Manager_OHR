import { S3Client } from '@aws-sdk/client-s3';

// Log configuration (without sensitive data)
console.log('Spaces Client Config:', {
  endpoint: process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  bucket: process.env.DO_SPACES_BUCKET,
  hasKey: !!process.env.DO_SPACES_KEY,
  hasSecret: !!process.env.DO_SPACES_SECRET,
});

export const spacesClient = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
});

export const BUCKET_NAME = process.env.DO_SPACES_BUCKET || ''; 