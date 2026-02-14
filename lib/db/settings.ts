import { sql } from '@vercel/postgres';

export interface Setting {
  key: string;
  value: string;
  updatedAt?: string;
}

/**
 * Get a setting value by key
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT value FROM settings WHERE key = ${key}
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0].value as string;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return null;
  }
}

/**
 * Set a setting value by key
 */
export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `;
    return true;
  } catch (error: any) {
    console.error(`Error setting ${key}:`, error);
    // Log more details for debugging
    if (error?.message) {
      console.error(`Database error message: ${error.message}`);
    }
    if (error?.code) {
      console.error(`Database error code: ${error.code}`);
    }
    // If table doesn't exist, throw a more specific error
    if (error?.message?.includes('does not exist') || error?.code === '42P01') {
      throw new Error('Settings table does not exist. Please run the database migration first.');
    }
    return false;
  }
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const result = await sql`
      SELECT key, value FROM settings
    `;
    
    const settings: Record<string, string> = {};
    result.rows.forEach((row) => {
      settings[row.key as string] = row.value as string;
    });
    
    return settings;
  } catch (error) {
    console.error('Error getting all settings:', error);
    return {};
  }
}
