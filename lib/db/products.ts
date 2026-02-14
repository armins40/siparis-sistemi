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
    
    return result.rows.map(row => {
      let price = row.price;
      if (price == null) {
        price = 0;
      } else if (typeof price === 'string') {
        price = parseFloat(price) || 0;
      } else if (typeof price !== 'number') {
        price = parseFloat(String(price)) || 0;
      }
      // Normalize stock
      let stock = row.stock;
      if (stock != null) {
        if (typeof stock === 'string') {
          stock = parseFloat(stock) || null;
        } else if (typeof stock !== 'number') {
          stock = parseFloat(String(stock)) || null;
        }
        if (stock !== null && isNaN(stock)) stock = null;
      }
      
      return {
        ...row,
        price,
        stock: stock ?? undefined,
        createdAt: new Date(row.createdAt).toISOString(),
      };
    }) as Product[];
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
    
    return result.rows.map(row => {
      let price = row.price;
      if (price == null) {
        price = 0;
      } else if (typeof price === 'string') {
        price = parseFloat(price) || 0;
      } else if (typeof price !== 'number') {
        price = parseFloat(String(price)) || 0;
      }
      // Normalize stock
      let stock = row.stock;
      if (stock != null) {
        if (typeof stock === 'string') {
          stock = parseFloat(stock) || null;
        } else if (typeof stock !== 'number') {
          stock = parseFloat(String(stock)) || null;
        }
        if (stock !== null && isNaN(stock)) stock = null;
      }
      
      return {
        ...row,
        price,
        stock: stock ?? undefined,
        createdAt: new Date(row.createdAt).toISOString(),
      };
    }) as Product[];
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
    
    return result.rows.map(row => {
      let price = row.price;
      if (price == null) {
        price = 0;
      } else if (typeof price === 'string') {
        price = parseFloat(price) || 0;
      } else if (typeof price !== 'number') {
        price = parseFloat(String(price)) || 0;
      }
      // Normalize stock
      let stock = row.stock;
      if (stock != null) {
        if (typeof stock === 'string') {
          stock = parseFloat(stock) || null;
        } else if (typeof stock !== 'number') {
          stock = parseFloat(String(stock)) || null;
        }
        if (stock !== null && isNaN(stock)) stock = null;
      }
      
      return {
        ...row,
        price,
        stock: stock ?? undefined,
        createdAt: new Date(row.createdAt).toISOString(),
      };
    }) as Product[];
  } catch (error) {
    console.error('Error fetching user products from DB:', error);
    return [];
  }
}

export async function getProductByIdFromDB(productId: string): Promise<Product | null> {
  try {
    const result = await sql`
      SELECT 
        id, name, price, category, image,
        is_published as "isPublished", stock, unit,
        created_at as "createdAt", sector,
        created_by as "createdBy", user_id as "userId"
      FROM products
      WHERE id = ${productId}
      LIMIT 1
    `;
    const row = result.rows[0];
    if (!row) return null;
    let price = row.price;
    if (price == null) price = 0;
    else if (typeof price === 'string') price = parseFloat(price) || 0;
    else if (typeof price !== 'number') price = parseFloat(String(price)) || 0;
    let stock = row.stock;
    if (stock != null && typeof stock === 'string') stock = parseFloat(stock) || null;
    else if (stock != null && typeof stock !== 'number') stock = parseFloat(String(stock)) || null;
    return {
      ...row,
      price,
      stock: stock ?? undefined,
      createdAt: new Date(row.createdAt).toISOString(),
    } as Product;
  } catch (error) {
    console.error('Error fetching product by id from DB:', error);
    return null;
  }
}

export async function getProductsByStoreSlugFromDB(storeSlug: string): Promise<Product[]> {
  try {
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      console.warn('⚠️ POSTGRES_URL not set, returning empty array');
      return [];
    }
    
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
    
    return result.rows.map(row => {
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
    // Admin ürünleri için store_slug NULL olmalı (tüm kullanıcılar görecek)
    // Normal ürünler için storeSlug veya product.userId kullan
    const finalStoreSlug = product.createdBy === 'admin' 
      ? null 
      : (storeSlug || product.userId || null);
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      console.error('POSTGRES_URL environment variable is not set');
      return false;
    }
    
    // If user_id is provided, ensure user exists in database
    if (product.userId) {
      try {
        const userCheck = await sql`
          SELECT id FROM users WHERE id = ${product.userId} LIMIT 1
        `;
        
        // If user doesn't exist, create a minimal user entry
        if (userCheck.rows.length === 0) {
          await sql`
            INSERT INTO users (id, plan, is_active, created_at, store_slug, sector)
            VALUES (
              ${product.userId},
              'trial',
              true,
              NOW(),
              ${finalStoreSlug || null},
              ${product.sector || null}
            )
            ON CONFLICT (id) DO NOTHING
          `;
        }
      } catch (userError: any) {
        console.warn('⚠️ Could not ensure user exists:', userError?.message);
        // Continue anyway - might be a users table issue
      }
    }
    
    // If store_slug is provided, ensure store exists in database
    if (finalStoreSlug) {
      try {
        // Check if store exists
        const storeCheck = await sql`
          SELECT slug FROM stores WHERE slug = ${finalStoreSlug} LIMIT 1
        `;
        
        // If store doesn't exist, create a minimal store entry
        if (storeCheck.rows.length === 0) {
          const storeName = product.name ? `${product.name} Store` : 'Store';
          await sql`
            INSERT INTO stores (slug, name, sector, created_at)
            VALUES (${finalStoreSlug}, ${storeName}, ${product.sector || null}, NOW())
            ON CONFLICT (slug) DO NOTHING
          `;
        }
      } catch (storeError: any) {
        console.warn('⚠️ Could not ensure store exists:', storeError?.message);
        // Continue anyway - might be a stores table issue
      }
    }
    
    // Try to insert or update product (UPSERT)
    try {
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
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          category = EXCLUDED.category,
          image = EXCLUDED.image,
          is_published = EXCLUDED.is_published,
          stock = EXCLUDED.stock,
          unit = EXCLUDED.unit,
          sector = EXCLUDED.sector,
          created_by = EXCLUDED.created_by,
          user_id = EXCLUDED.user_id,
          store_slug = EXCLUDED.store_slug
      `;
      return true;
    } catch (insertError: any) {
      // If foreign key constraint fails, try with NULL user_id
      if (insertError?.message?.includes('foreign key') || insertError?.code === '23503') {
        if (insertError?.constraint === 'products_user_id_fkey') {
          console.warn('⚠️ User foreign key constraint error. Trying with NULL user_id...');
          
          // Try inserting with NULL user_id
          try {
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
                NULL,
                ${finalStoreSlug}
              )
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price,
                category = EXCLUDED.category,
                image = EXCLUDED.image,
                is_published = EXCLUDED.is_published,
                stock = EXCLUDED.stock,
                unit = EXCLUDED.unit,
                sector = EXCLUDED.sector,
                created_by = EXCLUDED.created_by,
                user_id = EXCLUDED.user_id,
                store_slug = EXCLUDED.store_slug
            `;
            return true;
          } catch (nullUserError: any) {
            console.warn('⚠️ Failed even with NULL user_id:', nullUserError?.message);
            // Continue to try without store_slug as well
          }
        }
        
        // If it's a store_slug foreign key error, try without store_slug
        if (insertError?.constraint === 'products_store_slug_fkey') {
          console.warn('⚠️ Store foreign key constraint error. Trying without store_slug...');
          
          try {
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
                NULL
              )
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price,
                category = EXCLUDED.category,
                image = EXCLUDED.image,
                is_published = EXCLUDED.is_published,
                stock = EXCLUDED.stock,
                unit = EXCLUDED.unit,
                sector = EXCLUDED.sector,
                created_by = EXCLUDED.created_by,
                user_id = EXCLUDED.user_id,
                store_slug = EXCLUDED.store_slug
            `;
            return true;
          } catch (nullStoreError: any) {
            console.warn('⚠️ Failed even with NULL store_slug:', nullStoreError?.message);
          }
        }
      }
      // Re-throw if it's not a foreign key error or all fallbacks failed
      throw insertError;
    }
  } catch (error: any) {
    console.error('Error creating product in DB:', error);
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

export async function deleteAllAdminProductsFromDB(): Promise<{ success: boolean; deletedCount: number }> {
  try {
    // First, count how many admin products exist
    const countResult = await sql`
      SELECT COUNT(*) as count FROM products WHERE created_by = 'admin'
    `;
    const count = parseInt(countResult.rows[0]?.count || '0', 10);
    
    // Delete all admin products
    await sql`DELETE FROM products WHERE created_by = 'admin'`;
    
    return { success: true, deletedCount: count };
  } catch (error) {
    console.error('Error deleting all admin products from DB:', error);
    return { success: false, deletedCount: 0 };
  }
}
