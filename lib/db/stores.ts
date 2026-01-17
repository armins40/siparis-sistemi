// Database functions for Stores
import { sql } from './client';
import type { Store } from '@/lib/types';

export async function getStoreFromDB(slug: string): Promise<Store | null> {
  try {
    const result = await sql`
      SELECT 
        slug, name, description, logo, banner,
        address, phone, whatsapp, theme_id as "themeId", sector
      FROM stores
      WHERE slug = ${slug}
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as Store;
  } catch (error) {
    console.error('Error fetching store from DB:', error);
    return null;
  }
}

export async function createStoreInDB(store: Store): Promise<boolean> {
  try {
    await sql`
      INSERT INTO stores (
        slug, name, description, logo, banner,
        address, phone, whatsapp, theme_id, sector
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
        ${store.sector || null}
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
        updated_at = NOW()
    `;
    return true;
  } catch (error) {
    console.error('Error creating/updating store in DB:', error);
    return false;
  }
}

export async function updateStoreInDB(store: Store): Promise<boolean> {
  try {
    await sql`
      UPDATE stores
      SET 
        name = ${store.name},
        description = ${store.description || null},
        logo = ${store.logo || null},
        banner = ${store.banner || null},
        address = ${store.address || null},
        phone = ${store.phone || null},
        whatsapp = ${store.whatsapp || null},
        theme_id = ${store.themeId || 'modern-blue'},
        sector = ${store.sector || null},
        updated_at = NOW()
      WHERE slug = ${store.slug}
    `;
    return true;
  } catch (error) {
    console.error('Error updating store in DB:', error);
    return false;
  }
}
