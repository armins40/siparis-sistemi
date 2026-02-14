// S3 yardımcıları: ürün silindiğinde görseli S3'ten sil
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
const region = process.env.AWS_REGION || 'us-east-1';

function getS3Client(): S3Client | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey || !bucketName) return null;
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/**
 * Görsel URL'si bizim S3 bucket'ımıza aitse ilgili nesneyi S3'ten siler.
 * URL farklı bir kaynaktaysa (Cloudinary, dış link) hiçbir şey yapmaz.
 */
export async function deleteObjectByImageUrl(imageUrl: string | undefined): Promise<void> {
  if (!imageUrl || !imageUrl.startsWith('http')) return;
  const url = imageUrl.trim();
  if (!bucketName) return;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname || '';
    const pathname = parsed.pathname || '';
    const key = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    if (!key) return;

    const isOurS3 =
      host === `${bucketName}.s3.${region}.amazonaws.com` ||
      host === `${bucketName}.s3.amazonaws.com` ||
      host.endsWith('.s3.' + region + '.amazonaws.com');

    if (!isOurS3) return;

    const client = getS3Client();
    if (!client) return;

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (err) {
    console.warn('S3 delete by image URL failed (ignored):', err);
  }
}
