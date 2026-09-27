import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Enforce server-only execution
if (typeof window !== 'undefined') {
  throw new Error('Security Violation: r2-client must never be imported or executed in client-side code.');
}

export const R2_BUCKETS = {
  PUBLIC_ASSETS: process.env.R2_BUCKET_PUBLIC_ASSETS || 'oci-public-assets',
  APP_RELEASES: process.env.R2_BUCKET_APP_RELEASES || 'oci-app-releases',
  STUDY_MATERIALS: process.env.R2_BUCKET_STUDY_MATERIALS || 'oci-study-materials',
  ASSIGNMENTS: process.env.R2_BUCKET_ASSIGNMENTS || 'oci-assignments',
  MEDIA: process.env.R2_BUCKET_MEDIA || 'oci-media',
} as const;

export const R2_DOMAINS = {
  PUBLIC: process.env.R2_PUBLIC_DOMAIN || 'https://cdn.ociinstitute.com',
  DOWNLOAD: process.env.R2_DOWNLOAD_DOMAIN || 'https://download.ociinstitute.com',
} as const;

let _s3Client: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  );
}

export function getR2Client(): S3Client {
  if (_s3Client) return _s3Client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Cloudflare R2 Configuration Error: Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY in server environment variables.'
    );
  }

  _s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return _s3Client;
}

/**
 * Generates a short-lived presigned PUT URL for direct browser-to-R2 upload.
 * Avoids Vercel Serverless Function 4.5 MB request body limit for large files (APKs, PDFs).
 */
export async function generatePresignedUploadUrl(params: {
  bucket: string;
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; publicUrl?: string; key: string }> {
  const client = getR2Client();
  const expiresIn = params.expiresInSeconds || 3600; // 1 hour default

  const command = new PutObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });

  let publicUrl: string | undefined;
  if (params.bucket === R2_BUCKETS.PUBLIC_ASSETS) {
    publicUrl = `${R2_DOMAINS.PUBLIC}/${params.key}`;
  } else if (params.bucket === R2_BUCKETS.APP_RELEASES) {
    publicUrl = `${R2_DOMAINS.DOWNLOAD}/${params.key}`;
  }

  return { uploadUrl, publicUrl, key: params.key };
}

/**
 * Generates a short-lived presigned GET URL for secure downloading of private materials/assignments.
 */
export async function generatePresignedDownloadUrl(params: {
  bucket: string;
  key: string;
  expiresInSeconds?: number;
  fileName?: string;
}): Promise<string> {
  const client = getR2Client();
  const expiresIn = params.expiresInSeconds || 1800; // 30 minutes default

  const command = new GetObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    ResponseContentDisposition: params.fileName
      ? `attachment; filename="${encodeURIComponent(params.fileName)}"`
      : undefined,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Deletes an object from Cloudflare R2.
 */
export async function deleteR2Object(bucket: string, key: string): Promise<void> {
  const client = getR2Client();
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  await client.send(command);
}
