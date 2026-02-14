// AWS S3 Image Upload API Route
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 60;

// AWS S3 Client initialization
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export async function POST(request: NextRequest) {
  try {
    // AWS S3 environment variables kontrolü
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      console.error('❌ AWS S3 environment variables missing:', {
        hasAccessKeyId: !!accessKeyId,
        hasSecretAccessKey: !!secretAccessKey,
        hasBucketName: !!bucketName,
      });
      return NextResponse.json(
        { 
          error: 'AWS S3 yapılandırması eksik',
          details: 'AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME ve AWS_REGION environment değişkenlerini Vercel\'e ekleyin.'
        },
        { status: 500 }
      );
    }

    // FormData'dan dosyayı al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'siparis'; // Varsayılan klasör

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Geçersiz dosya tipi. Sadece görsel dosyaları yüklenebilir.' },
        { status: 400 }
      );
    }

    // Dosya boyutunu kontrol et (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan küçük olmalıdır' },
        { status: 400 }
      );
    }

    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosya uzantısını al
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    // S3'e yükle
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Public URL oluştur
    // Eğer CloudFront kullanıyorsanız, CLOUDFRONT_URL kullanın
    const cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL;
    const url = cloudfrontUrl 
      ? `${cloudfrontUrl}/${fileName}`
      : `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
      key: fileName,
    });
  } catch (error: unknown) {
    console.error('❌ /api/upload-s3 error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    let userMessage = 'Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin veya Vercel loglarını kontrol edin.';
    
    if (/InvalidAccessKeyId|SignatureDoesNotMatch|403|Forbidden/i.test(msg)) {
      userMessage = 'AWS S3 erişim anahtarları geçersiz. Vercel environment variables\'ı kontrol edin.';
    } else if (/NoSuchBucket|404/i.test(msg)) {
      userMessage = 'AWS S3 bucket bulunamadı. Bucket adını kontrol edin.';
    }
    
    return NextResponse.json(
      {
        error: userMessage,
        ...(process.env.NODE_ENV === 'development' && { details: msg }),
      },
      { status: 500 }
    );
  }
}
