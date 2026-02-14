import { NextRequest, NextResponse } from 'next/server';
import { getProductsByUserIdFromDB, deleteProductFromDB, updateProductInDB, getProductByIdFromDB } from '@/lib/db/products';
import { deleteObjectByImageUrl } from '@/lib/s3';
import type { Product } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const products = await getProductsByUserIdFromDB(userId);
    
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error in /api/products/list:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId parameter is required' },
        { status: 400 }
      );
    }

    const product = await getProductByIdFromDB(productId);
    const success = await deleteProductFromDB(productId);
    
    if (success && product?.image) {
      await deleteObjectByImageUrl(product.image);
    }
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Ürün başarıyla silindi' 
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { product } = body;

    if (!product || !product.id) {
      return NextResponse.json(
        { success: false, error: 'Product data with ID is required' },
        { status: 400 }
      );
    }

    const success = await updateProductInDB(product as Product);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
