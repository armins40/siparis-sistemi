// Database functions for Categories (global = store_slug IS NULL, admin tarafından yönetilir)
import { sql } from './client';
import type { Category } from '@/lib/types';

/** Global kategorileri getirir (admin panelinde oluşturulan, tüm kullanıcılarda görünen) */
export async function getGlobalCategoriesFromDB(): Promise<Category[]> {
  try {
    const result = await sql`
      SELECT id, name, "order"
      FROM categories
      WHERE store_slug IS NULL
      ORDER BY "order" ASC NULLS LAST, name ASC
    `;
    const rows = (result.rows || []) as Array<{ id: string; name: string; order: number | null }>;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      order: row.order ?? 0,
    })) as Category[];
  } catch (error) {
    console.error('Error fetching global categories from DB:', error);
    return [];
  }
}

/** ID ile kategori getir */
export async function getCategoryByIdFromDB(id: string): Promise<Category | null> {
  try {
    const result = await sql`
      SELECT id, name, "order"
      FROM categories
      WHERE id = ${id} AND store_slug IS NULL
      LIMIT 1
    `;
    const row = result.rows?.[0];
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      order: row.order ?? 0,
    } as Category;
  } catch (error) {
    console.error('Error fetching category by id from DB:', error);
    return null;
  }
}

/** Aynı isimde global kategori var mı (id hariç) */
export async function existsGlobalCategoryByName(name: string, excludeId?: string): Promise<boolean> {
  try {
    const nameLower = name.trim().toLowerCase();
    let result;
    if (excludeId) {
      result = await sql`
        SELECT 1 FROM categories
        WHERE store_slug IS NULL
          AND LOWER(TRIM(name)) = ${nameLower}
          AND id != ${excludeId}
        LIMIT 1
      `;
    } else {
      result = await sql`
        SELECT 1 FROM categories
        WHERE store_slug IS NULL
          AND LOWER(TRIM(name)) = ${nameLower}
        LIMIT 1
      `;
    }
    return (result.rows?.length ?? 0) > 0;
  } catch (error) {
    console.error('Error checking category name from DB:', error);
    return true; // hata durumunda duplicate kabul et
  }
}

/** Global kategori ekle */
export async function createGlobalCategoryInDB(name: string): Promise<Category | null> {
  try {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const exists = await existsGlobalCategoryByName(trimmed);
    if (exists) return null;

    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const countResult = await sql`
      SELECT COALESCE(MAX("order"), 0) + 1 AS next_order
      FROM categories
      WHERE store_slug IS NULL
    `;
    const order = Number(countResult.rows?.[0]?.next_order ?? 0);

    await sql`
      INSERT INTO categories (id, name, "order", store_slug)
      VALUES (${id}, ${trimmed}, ${order}, NULL)
    `;

    return { id, name: trimmed, order } as Category;
  } catch (error) {
    console.error('Error creating global category in DB:', error);
    return null;
  }
}

/** Global kategori güncelle */
export async function updateGlobalCategoryInDB(
  id: string,
  updates: { name?: string }
): Promise<Category | null> {
  try {
    const existing = await getCategoryByIdFromDB(id);
    if (!existing) return null;

    if (updates.name !== undefined) {
      const trimmed = updates.name.trim();
      if (!trimmed) return null;
      const exists = await existsGlobalCategoryByName(trimmed, id);
      if (exists) return null;
      await sql`
        UPDATE categories
        SET name = ${trimmed}
        WHERE id = ${id} AND store_slug IS NULL
      `;
      return { ...existing, name: trimmed } as Category;
    }
    return existing;
  } catch (error) {
    console.error('Error updating global category in DB:', error);
    return null;
  }
}

/** Global kategori sil */
export async function deleteGlobalCategoryInDB(id: string): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM categories
      WHERE id = ${id} AND store_slug IS NULL
    `;
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting global category from DB:', error);
    return false;
  }
}

/** Toplu global kategori ekle */
export async function addBulkGlobalCategoriesInDB(
  categoryNames: string[]
): Promise<{ added: number; skipped: number }> {
  let added = 0;
  let skipped = 0;
  for (const name of categoryNames) {
    const created = await createGlobalCategoryInDB(name);
    if (created) added++;
    else skipped++;
  }
  return { added, skipped };
}
