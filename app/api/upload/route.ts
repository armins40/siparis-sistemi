// Cloudinary Image Upload API Route
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';
export const maxDuration = 60;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Cloudinary environment variables kontrolü
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Cloudinary environment variables missing:', {
        hasCloudName: !!cloudName,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
      });
      return NextResponse.json(
        { 
          error: 'Cloudinary yapılandırması eksik',
          details: 'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ve CLOUDINARY_API_SECRET environment değişkenlerini Vercel\'e ekleyin.'
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

    let dataURI: string;
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      dataURI = `data:${file.type};base64,${base64}`;
    } catch (e) {
      console.error('❌ Upload buffer error:', e);
      return NextResponse.json(
        { error: 'Dosya işlenirken hata oluştu. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });

    const url = uploadResult?.secure_url;
    if (!url) {
      console.error('❌ Cloudinary returned no URL:', uploadResult);
      return NextResponse.json(
        { error: 'Cloudinary yanıt vermedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url,
      public_id: uploadResult?.public_id,
    });
  } catch (error: unknown) {
    console.error('❌ /api/upload error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    let userMessage = 'Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin veya Vercel loglarını kontrol edin.';
    if (/Invalid API Key|Invalid signature|401|Unauthorized/i.test(msg)) {
      userMessage = 'Cloudinary API anahtarı geçersiz. Vercel environment variables\'ı kontrol edin.';
    } else if (/Cloud name|cloud_name/i.test(msg)) {
      userMessage = 'Cloudinary cloud name geçersiz. Vercel environment variables\'ı kontrol edin.';
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
