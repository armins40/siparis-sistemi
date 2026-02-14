import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import {
  getGlobalCategoriesFromDB,
  createGlobalCategoryInDB,
  updateGlobalCategoryInDB,
  deleteGlobalCategoryInDB,
  addBulkGlobalCategoriesInDB,
} from '@/lib/db/categories';

async function handleGet() {
  try {
    const categories = await getGlobalCategoriesFromDB();
    return NextResponse.json({ success: true, categories });
  } catch (error: unknown) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || 'Kategoriler yüklenemedi' },
      { status: 500 }
    );
  }
}

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();

    // Toplu ekleme
    if (body.bulkNames && Array.isArray(body.bulkNames)) {
      const { added, skipped } = await addBulkGlobalCategoriesInDB(body.bulkNames);
      return NextResponse.json({ success: true, added, skipped });
    }

    // Tekil ekleme
    const name = body.name ?? body.category?.name;
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Kategori adı gerekli' },
        { status: 400 }
      );
    }

    const category = await createGlobalCategoryInDB(name);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Bu isim zaten kullanılıyor veya eklenemedi' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, category });
  } catch (error: unknown) {
    console.error('Error creating admin category:', error);
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || 'Kategori eklenemedi' },
      { status: 500 }
    );
  }
}

async function handlePut(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id ?? body.category?.id;
    const name = body.name ?? body.category?.name;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Kategori id gerekli' },
        { status: 400 }
      );
    }
    if (name === undefined || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Kategori adı gerekli' },
        { status: 400 }
      );
    }

    const category = await updateGlobalCategoryInDB(id, { name });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Güncellenemedi veya bu isim zaten kullanılıyor' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, category });
  } catch (error: unknown) {
    console.error('Error updating admin category:', error);
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || 'Kategori güncellenemedi' },
      { status: 500 }
    );
  }
}

async function handleDelete(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Kategori id gerekli' },
        { status: 400 }
      );
    }

    const deleted = await deleteGlobalCategoryInDB(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Kategori silinemedi' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting admin category:', error);
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || 'Kategori silinemedi' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, () => handleGet());
}

export async function POST(request: NextRequest) {
  return requireAdminAuth(request, () => handlePost(request));
}

export async function PUT(request: NextRequest) {
  return requireAdminAuth(request, () => handlePut(request));
}

export async function DELETE(request: NextRequest) {
  return requireAdminAuth(request, () => handleDelete(request));
}
