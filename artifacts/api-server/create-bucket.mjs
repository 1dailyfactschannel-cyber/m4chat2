import { S3Client, CreateBucketCommand, HeadBucketCommand, ListBucketsCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: 'http://91.227.68.138:9010',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'm4chat',
    secretAccessKey: 'changeme',
  },
  forcePathStyle: true,
});

async function main() {
  try {
    const list = await s3.send(new ListBucketsCommand({}));
    console.log('Existing buckets:', list.Buckets?.map((b) => b.Name));
  } catch (e) {
    console.log('List buckets failed:', e.message);
  }

  try {
    const head = await s3.send(new HeadBucketCommand({ Bucket: 'm4chat' }));
    console.log('Bucket m4chat exists');
    return;
  } catch (e) {
    console.log('Head bucket: not found');
  }

  try {
    const result = await s3.send(new CreateBucketCommand({ Bucket: 'm4chat' }));
    console.log('Created bucket, status:', result.$metadata.httpStatusCode);
  } catch (e) {
    console.log('Create failed:', e.name, '-', e.message);
  }
}

main();