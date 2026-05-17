import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_ENDPOINT = process.env.S3_ENDPOINT || "http://localhost:9000";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || "m4chat";
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || "changeme";
const S3_BUCKET = process.env.S3_BUCKET || "m4chat";
const S3_REGION = process.env.S3_REGION || "us-east-1";

export const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const S3_PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT || S3_ENDPOINT;

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return `${S3_PUBLIC_ENDPOINT}/${S3_BUCKET}/${key}`;
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  );
}

export { S3_BUCKET };
