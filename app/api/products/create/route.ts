import { NextRequest, NextResponse } from 'next/server';
import { createProductInDB } from '@/lib/db/products';
import { apiRateLimit } from '@/lib/rate-limit';
import { isValidProductName, isValidPrice, isValidCategoryName, isValidUrl, sanitizeString } from '@/lib/validation';
import type { Product } from '@/lib/types';

async function handleCreate(request: NextRequest) {
  try {
    // Check POSTGRES_URL environment variable
    if (!process.env.POSTGRES_URL) {
      console.error('POSTGRES_URL is not set in server environment');
      return NextResponse.json(
        { 
          success: false, 
          error: 'POSTGRES_URL environment variable is not configured'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { product, storeSlug } = body;

    // Input validation
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Ürün bilgileri gerekli' },
        { status: 400 }
      );
    }

    // Validate product name
    const nameValidation = isValidProductName(product.name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { success: false, error: nameValidation.error || 'Geçersiz ürün adı' },
        { status: 400 }
      );
    }

    // Validate price
    const priceValidation = isValidPrice(product.price);
    if (!priceValidation.valid) {
      return NextResponse.json(
        { success: false, error: priceValidation.error || 'Geçersiz fiyat' },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (product.category) {
      const categoryValidation = isValidCategoryName(product.category);
      if (!categoryValidation.valid) {
        return NextResponse.json(
          { success: false, error: categoryValidation.error || 'Geçersiz kategori adı' },
          { status: 400 }
        );
      }
    }

    // Validate and sanitize image URL if provided
    if (product.image) {
      const trimmedImage = typeof product.image === 'string' ? product.image.trim() : '';
      if (trimmedImage === '' || !isValidUrl(trimmedImage)) {
        // Geçersiz veya boş görsel URL'i kaldır (hata verme, sadece görseli kaldır)
        product.image = undefined;
      } else {
        product.image = trimmedImage;
      }
    }

    // Sanitize inputs
    product.name = sanitizeString(product.name, 200);
    if (product.category) {
      product.category = sanitizeString(product.category, 100);
    }
    if (product.price !== undefined && priceValidation.value !== undefined) {
      product.price = priceValidation.value;
    }

    const dbSuccess = await createProductInDB(product, storeSlug);
    
    if (!dbSuccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save product to database'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/products/create:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return apiRateLimit(request, handleCreate);
}
