import { NextRequest, NextResponse } from 'next/server';
import { createStoreInDB, updateStoreInDB, getStoreFromDB } from '@/lib/db/stores';
import { sql } from '@/lib/db/client';
import type { Store } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json({ success: false, error: 'POSTGRES_URL not configured' }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }
    const store = await getStoreFromDB(slug);
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, store });
  } catch (e: any) {
    console.error('GET /api/stores:', e);
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check POSTGRES_URL environment variable
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL is not set in server environment');
      return NextResponse.json(
        { 
          success: false, 
          error: 'POSTGRES_URL environment variable is not configured',
          details: 'Please add POSTGRES_URL to Vercel Environment Variables'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { store } = body;

    if (!store || !store.slug || !store.name) {
      return NextResponse.json(
        { success: false, error: 'Store data with slug and name is required' },
        { status: 400 }
      );
    }

    const dbSuccess = await createStoreInDB(store as Store);
    
    if (!dbSuccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save store to database'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/stores:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Internal server error',
        details: error?.stack || 'Check server logs for details'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL is not set in server environment');
      return NextResponse.json(
        { 
          success: false, 
          error: 'POSTGRES_URL environment variable is not configured',
          details: 'Please add POSTGRES_URL to Vercel Environment Variables'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { store, oldSlug } = body;

    if (!store || !store.slug || !store.name) {
      return NextResponse.json(
        { success: false, error: 'Store data with slug and name is required' },
        { status: 400 }
      );
    }

    // Slug değiştiyse, eski slug'dan yeni slug'a migrate et
    if (oldSlug && oldSlug !== store.slug) {
      const { sql } = await import('@/lib/db/client');
      
      try {
        // 1. Yeni slug ile mağaza oluştur (veya güncelle)
        const openingHoursJson = store.openingHours && Object.keys(store.openingHours).length > 0
          ? JSON.stringify(store.openingHours)
          : null;
        await sql`
          INSERT INTO stores (
            slug, name, description, logo, banner,
            address, phone, whatsapp, theme_id, sector, delivery_fee,
            opening_hours, google_review_url
          ) VALUES (
            ${store.slug},
            ${store.name},
            ${store.description || null},
            ${store.logo || null},
            ${store.banner || null},
            ${store.address || null},
            ${store.phone || null},
            ${store.whatsapp || null},
            ${store.themeId || 'modern-blue'},
            ${store.sector || null},
            ${store.deliveryFee || null},
            ${openingHoursJson}::jsonb,
            ${store.googleReviewUrl?.trim() || null}
          )
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            logo = EXCLUDED.logo,
            banner = EXCLUDED.banner,
            address = EXCLUDED.address,
            phone = EXCLUDED.phone,
            whatsapp = EXCLUDED.whatsapp,
            theme_id = EXCLUDED.theme_id,
            sector = EXCLUDED.sector,
            delivery_fee = EXCLUDED.delivery_fee,
            opening_hours = EXCLUDED.opening_hours,
            google_review_url = EXCLUDED.google_review_url,
            updated_at = NOW()
        `;
        
        // 2. Users tablosundaki store_slug'ı güncelle
        await sql`
          UPDATE users
          SET store_slug = ${store.slug}
          WHERE store_slug = ${oldSlug}
        `;
        
        // 3. Products tablosundaki store_slug'ları güncelle
        await sql`
          UPDATE products
          SET store_slug = ${store.slug}
          WHERE store_slug = ${oldSlug}
        `;
        
        // 4. Eski mağazayı sil
        await sql`DELETE FROM stores WHERE slug = ${oldSlug}`;
        
      } catch (migrateError: any) {
        console.error('❌ Error migrating store slug:', migrateError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update store slug',
            details: migrateError?.message || 'Check server logs'
          },
          { status: 500 }
        );
      }
    } else {
      // Slug değişmediyse normal güncelleme
      const dbSuccess = await updateStoreInDB(store as Store);
      
      if (!dbSuccess) {
        console.error('❌ updateStoreInDB returned false');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update store in database',
            details: 'Check server logs for more information'
          },
          { status: 500 }
        );
      }
    }

    console.log('✅ Store updated successfully via API route');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error in /api/stores PUT:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Internal server error',
        details: error?.stack || 'Check server logs for details'
      },
      { status: 500 }
    );
  }
}
