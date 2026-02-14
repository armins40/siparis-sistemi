// Kullanıcı dashboard'unda görünecek global kategorileri döner (admin panelinde oluşturulan)
import { NextResponse } from 'next/server';
import { getGlobalCategoriesFromDB } from '@/lib/db/categories';

export async function GET() {
  try {
    const categories = await getGlobalCategoriesFromDB();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Kategoriler yüklenemedi' },
      { status: 500 }
    );
  }
}
