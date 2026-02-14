// S3'ten görsel silme (logo, banner, ürün görseli vb.)
import { NextRequest, NextResponse } from 'next/server';
import { deleteObjectByImageUrl } from '@/lib/s3';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = typeof body.url === 'string' ? body.url.trim() : '';

    if (!url || !url.startsWith('http')) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir URL gerekli' },
        { status: 400 }
      );
    }

    await deleteObjectByImageUrl(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ /api/upload-s3/delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Görsel silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
