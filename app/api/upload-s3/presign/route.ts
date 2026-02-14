// Presigned URL: Tarayıcı dosyayı doğrudan S3'e yükler (Vercel 4.5MB limitini aşar)
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 30;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { error: 'AWS S3 yapılandırması eksik' },
        { status: 500 }
      );
    }

    let body: { contentType?: string; folder?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const contentType = (body.contentType || 'image/jpeg').toString();
    const folder = (body.folder || 'products').toString();
    const ext = contentType.includes('png') ? 'png' : contentType.includes('gif') ? 'gif' : 'jpg';
    const key = `${folder}/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 dk

    const cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL;
    const finalUrl = cloudfrontUrl
      ? `${cloudfrontUrl}/${key}`
      : `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      url: finalUrl,
      key,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ /api/upload-s3/presign error:', error);
    return NextResponse.json(
      {
        error: 'Presigned URL alınamadı. AWS ayarlarını kontrol edin.',
        ...(process.env.NODE_ENV === 'development' && { details: msg }),
      },
      { status: 500 }
    );
  }
}
