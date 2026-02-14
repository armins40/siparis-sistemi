import { NextRequest, NextResponse } from 'next/server';
import { deleteAllAdminProductsFromDB } from '@/lib/db/products';
import { requireAdminAuth } from '@/lib/admin-auth';

async function handleDelete(request: NextRequest) {
  try {
    const result = await deleteAllAdminProductsFromDB();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${result.deletedCount} admin ürünü silindi`,
        deletedCount: result.deletedCount,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Admin ürünleri silinirken bir hata oluştu' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error deleting all admin products:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Bilinmeyen bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  return requireAdminAuth(request, handleDelete);
}
