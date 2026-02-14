import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { createProductInDB, updateProductInDB, deleteProductFromDB, getProductByIdFromDB } from '@/lib/db/products';
import { deleteObjectByImageUrl } from '@/lib/s3';
import { requireAdminAuth } from '@/lib/admin-auth';
import type { Product } from '@/lib/types';

// GET: Fetch all admin products
async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');

    let query;
    if (sector && sector !== 'all') {
      query = sql`
        SELECT 
          id, name, price, category, image,
          is_published as "isPublished", stock, unit,
          created_at as "createdAt", sector,
          created_by as "createdBy", user_id as "userId", store_slug as "storeSlug"
        FROM products
        WHERE created_by = 'admin' AND (sector = ${sector} OR sector = 'all')
        ORDER BY created_at DESC
      `;
    } else {
      query = sql`
        SELECT 
          id, name, price, category, image,
          is_published as "isPublished", stock, unit,
          created_at as "createdAt", sector,
          created_by as "createdBy", user_id as "userId", store_slug as "storeSlug"
        FROM products
        WHERE created_by = 'admin'
        ORDER BY created_at DESC
      `;
    }

    const result = await query;
    
    const products: Product[] = result.rows.map(row => {
      let price = row.price;
      if (price == null) {
        price = 0;
      } else if (typeof price === 'string') {
        price = parseFloat(price) || 0;
      } else if (typeof price !== 'number') {
        price = parseFloat(String(price)) || 0;
      }
      return {
        ...row,
        price,
        createdAt: new Date(row.createdAt).toISOString(),
      };
    }) as Product[];

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching admin products from DB:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, handleGet);
}

// POST: Create admin product
async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { product } = body;

    if (!product || !product.name || product.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Product data is required' },
        { status: 400 }
      );
    }

    const dbSuccess = await createProductInDB(product, undefined);
    
    if (!dbSuccess) {
      return NextResponse.json(
        { success: false, error: 'Failed to save product to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating admin product:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return requireAdminAuth(request, handlePost);
}

// PUT: Update admin product
async function handlePut(request: NextRequest) {
  try {
    const body = await request.json();
    const { product } = body;

    if (!product || !product.id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const success = await updateProductInDB(product);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating admin product:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return requireAdminAuth(request, handlePut);
}

// DELETE: Delete admin product
async function handleDelete(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
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
    console.error('Error deleting admin product:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  return requireAdminAuth(request, handleDelete);
}
