// Database functions for Products
import { sql } from './client';
import type { Product } from '@/lib/types';

export async function getAllProductsFromDB(): Promise<Product[]> {
  try {
    const result = await sql`
      SELECT 
        id, name, price, category, image, 
        is_published as "isPublished", stock, unit,
        created_at as "createdAt", sector, 
        created_by as "createdBy", user_id as "userId"
      FROM products
      ORDER BY created_at DESC
    `;
    
    return result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products from DB:', error);
    return [];
  }
}

export async function getPublishedProductsFromDB(storeSlug?: string): Promise<Product[]> {
  try {
    let result;
    
    if (storeSlug) {
      result = await sql`
        SELECT 
          id, name, price, category, image,
          is_published as "isPublished", stock, unit,
          created_at as "createdAt", sector,
          created_by as "createdBy", user_id as "userId"
        FROM products
        WHERE is_published = true 
          AND (store_slug = ${storeSlug} OR store_slug IS NULL)
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql`
        SELECT 
          id, name, price, category, image,
          is_published as "isPublished", stock, unit,
          created_at as "createdAt", sector,
          created_by as "createdBy", user_id as "userId"
        FROM products
        WHERE is_published = true
        ORDER BY created_at DESC
      `;
    }
    
    return result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching published products from DB:', error);
    return [];
  }
}

export async function getProductsByUserIdFromDB(userId: string): Promise<Product[]> {
  try {
    const result = await sql`
      SELECT 
        id, name, price, category, image,
        is_published as "isPublished", stock, unit,
        created_at as "createdAt", sector,
        created_by as "createdBy", user_id as "userId"
      FROM products
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    
    return result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching user products from DB:', error);
    return [];
  }
}

export async function getProductsByStoreSlugFromDB(storeSlug: string): Promise<Product[]> {
  try {
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      console.warn('⚠️ POSTGRES_URL not set, returning empty array');
      return [];
    }
    
    console.log('🔍 Fetching products for store_slug:', storeSlug);
    const result = await sql`
      SELECT 
        id, name, price, category, image,
        is_published as "isPublished", stock, unit,
        created_at as "createdAt", sector,
        created_by as "createdBy", user_id as "userId", store_slug as "storeSlug"
      FROM products
      WHERE store_slug = ${storeSlug} AND is_published = true
      ORDER BY created_at DESC
    `;
    
    console.log('📦 Found products:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('📦 Sample product:', result.rows[0]);
    }
    
    return result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
    })) as Product[];
  } catch (error: any) {
    console.error('❌ Error fetching store products from DB:', error);
    console.error('❌ Error message:', error?.message);
    
    // If table doesn't exist, return empty array (will fallback to localStorage)
    if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
      console.warn('💡 Products table does not exist. Using localStorage fallback.');
    }
    
    return [];
  }
}

export async function createProductInDB(product: Product, storeSlug?: string): Promise<boolean> {
  try {
    const finalStoreSlug = storeSlug || product.userId || null;
    console.log('💾 Saving product to DB:', {
      id: product.id,
      name: product.name,
      storeSlug: finalStoreSlug,
      userId: product.userId,
      isPublished: product.isPublished
    });
    
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable is not set');
      console.error('💡 Please add POSTGRES_URL to Vercel Environment Variables');
      return false;
    }
    
    await sql`
      INSERT INTO products (
        id, name, price, category, image,
        is_published, stock, unit,
        created_at, sector, created_by, user_id, store_slug
      ) VALUES (
        ${product.id},
        ${product.name},
        ${product.price},
        ${product.category},
        ${product.image || null},
        ${product.isPublished},
        ${product.stock || null},
        ${product.unit || 'adet'},
        ${product.createdAt},
        ${product.sector || null},
        ${product.createdBy || 'user'},
        ${product.userId || null},
        ${finalStoreSlug}
      )
    `;
    console.log('✅ Product saved to DB successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Error creating product in DB:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error code:', error?.code);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    
    // More specific error messages
    if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
      console.error('💡 Database table does not exist. Please run schema.sql in your database.');
    } else if (error?.message?.includes('connection') || error?.code === 'ECONNREFUSED') {
      console.error('💡 Database connection failed. Check POSTGRES_URL environment variable.');
    }
    
    return false;
  }
}

export async function updateProductInDB(product: Product): Promise<boolean> {
  try {
    await sql`
      UPDATE products
      SET 
        name = ${product.name},
        price = ${product.price},
        category = ${product.category},
        image = ${product.image || null},
        is_published = ${product.isPublished},
        stock = ${product.stock || null},
        unit = ${product.unit || 'adet'},
        sector = ${product.sector || null}
      WHERE id = ${product.id}
    `;
    return true;
  } catch (error) {
    console.error('Error updating product in DB:', error);
    return false;
  }
}

export async function deleteProductFromDB(productId: string): Promise<boolean> {
  try {
    await sql`DELETE FROM products WHERE id = ${productId}`;
    return true;
  } catch (error) {
    console.error('Error deleting product from DB:', error);
    return false;
  }
}
