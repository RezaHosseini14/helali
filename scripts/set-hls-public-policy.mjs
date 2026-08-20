/**
 * Makes HLS objects under video-bucket/hls/* publicly readable
 * so browsers can fetch .m3u8 + .ts without per-segment presigns.
 */
import { Client } from 'minio';

const endPoint = process.env.MINIO_ENDPOINT ?? '5.159.49.36';
const port = Number(process.env.MINIO_PORT ?? '9010');
const accessKey = process.env.MINIO_ACCESS_KEY ?? 'minio99';
const secretKey = process.env.MINIO_SECRET_KEY ?? 'minio123';
const bucket = 'video-bucket';

const policy = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: { AWS: ['*'] },
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${bucket}/hls/*`],
    },
  ],
};

async function main() {
  const client = new Client({
    endPoint,
    port,
    useSSL: false,
    accessKey,
    secretKey,
    pathStyle: true,
  });

  const exists = await client.bucketExists(bucket);
  if (!exists) {
    await client.makeBucket(bucket, 'us-east-1');
    console.log(`Created bucket ${bucket}`);
  }

  await client.setBucketPolicy(bucket, JSON.stringify(policy));
  console.log(`Public GetObject enabled for ${bucket}/hls/* on ${endPoint}:${port}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
