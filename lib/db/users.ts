// Database functions for Users
import { sql } from './client';
import type { User } from '@/lib/types';

export async function getUserByIdFromDB(userId: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT 
        id, email, phone, name, password,
        plan, is_active as "isActive",
        created_at as "createdAt",
        expires_at as "expiresAt",
        store_slug as "storeSlug",
        sector,
        email_verified as "emailVerified",
        phone_verified as "phoneVerified",
        payment_method_id as "paymentMethodId"
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
      expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : undefined,
    } as User;
  } catch (error) {
    console.error('Error fetching user by id from DB:', error);
    return null;
  }
}

export async function getUserByStoreSlugFromDB(storeSlug: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT 
        id, email, phone, name, password,
        plan, is_active as "isActive",
        created_at as "createdAt",
        expires_at as "expiresAt",
        store_slug as "storeSlug",
        sector,
        email_verified as "emailVerified",
        phone_verified as "phoneVerified",
        payment_method_id as "paymentMethodId"
      FROM users
      WHERE store_slug = ${storeSlug}
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
      expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : undefined,
    } as User;
  } catch (error) {
    console.error('Error fetching user by store slug from DB:', error);
    return null;
  }
}

export async function getUserByEmailFromDB(email: string): Promise<User | null> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await sql`
      SELECT 
        id, email, phone, name, password,
        plan, is_active as "isActive",
        created_at as "createdAt",
        expires_at as "expiresAt",
        store_slug as "storeSlug",
        sector,
        email_verified as "emailVerified",
        phone_verified as "phoneVerified",
        payment_method_id as "paymentMethodId"
      FROM users
      WHERE LOWER(TRIM(email)) = ${normalizedEmail}
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
      expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : undefined,
    } as User;
  } catch (error) {
    console.error('Error fetching user by email from DB:', error);
    return null;
  }
}

export async function getUserByPhoneFromDB(phone: string): Promise<User | null> {
  try {
    const normalizedPhone = phone.trim();
    const result = await sql`
      SELECT 
        id, email, phone, name, password,
        plan, is_active as "isActive",
        created_at as "createdAt",
        expires_at as "expiresAt",
        store_slug as "storeSlug",
        sector,
        email_verified as "emailVerified",
        phone_verified as "phoneVerified",
        payment_method_id as "paymentMethodId"
      FROM users
      WHERE TRIM(phone) = ${normalizedPhone}
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
      expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : undefined,
    } as User;
  } catch (error) {
    console.error('Error fetching user by phone from DB:', error);
    return null;
  }
}

export async function createUserInDB(user: User): Promise<boolean> {
  try {
    await sql`
      INSERT INTO users (
        id, email, phone, name, password,
        plan, is_active, created_at, expires_at,
        store_slug, sector,
        email_verified, phone_verified, payment_method_id
      ) VALUES (
        ${user.id},
        ${user.email || null},
        ${user.phone || null},
        ${user.name || null},
        ${user.password || null},
        ${user.plan || 'trial'},
        ${user.isActive || false},
        ${user.createdAt || new Date().toISOString()},
        ${user.expiresAt || null},
        ${user.storeSlug || null},
        ${user.sector || null},
        ${user.emailVerified || false},
        ${user.phoneVerified || false},
        ${user.paymentMethodId || null}
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        plan = EXCLUDED.plan,
        is_active = EXCLUDED.is_active,
        expires_at = EXCLUDED.expires_at,
        store_slug = EXCLUDED.store_slug,
        sector = EXCLUDED.sector,
        email_verified = EXCLUDED.email_verified,
        phone_verified = EXCLUDED.phone_verified,
        payment_method_id = EXCLUDED.payment_method_id
    `;
    return true;
  } catch (error) {
    console.error('Error creating user in DB:', error);
    return false;
  }
}

export async function updateUserInDB(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    // Build dynamic update query using template literals
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (updates.email !== undefined) {
      setParts.push(`email = $${paramIndex}`);
      values.push(updates.email);
      paramIndex++;
    }
    if (updates.phone !== undefined) {
      setParts.push(`phone = $${paramIndex}`);
      values.push(updates.phone);
      paramIndex++;
    }
    if (updates.name !== undefined) {
      setParts.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.password !== undefined) {
      setParts.push(`password = $${paramIndex}`);
      values.push(updates.password);
      paramIndex++;
    }
    if (updates.plan !== undefined) {
      setParts.push(`plan = $${paramIndex}`);
      values.push(updates.plan);
      paramIndex++;
    }
    if (updates.isActive !== undefined) {
      setParts.push(`is_active = $${paramIndex}`);
      values.push(updates.isActive);
      paramIndex++;
    }
    if (updates.expiresAt !== undefined) {
      setParts.push(`expires_at = $${paramIndex}`);
      values.push(updates.expiresAt);
      paramIndex++;
    }
    if (updates.storeSlug !== undefined) {
      setParts.push(`store_slug = $${paramIndex}`);
      values.push(updates.storeSlug);
      paramIndex++;
    }
    if (updates.sector !== undefined) {
      setParts.push(`sector = $${paramIndex}`);
      values.push(updates.sector);
      paramIndex++;
    }
    if (updates.emailVerified !== undefined) {
      setParts.push(`email_verified = $${paramIndex}`);
      values.push(updates.emailVerified);
      paramIndex++;
    }
    if (updates.phoneVerified !== undefined) {
      setParts.push(`phone_verified = $${paramIndex}`);
      values.push(updates.phoneVerified);
      paramIndex++;
    }
    if (updates.paymentMethodId !== undefined) {
      setParts.push(`payment_method_id = $${paramIndex}`);
      values.push(updates.paymentMethodId);
      paramIndex++;
    }
    
    if (setParts.length === 0) {
      return true; // Nothing to update
    }
    
    // @vercel/postgres doesn't support sql.unsafe
    // Instead, we'll fetch the user first and update all fields
    const existingUser = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;
    
    if (existingUser.rows.length === 0) {
      return false;
    }
    
    const current = existingUser.rows[0];
    
    // Update with merged values
    await sql`
      UPDATE users SET
        email = ${updates.email ?? current.email},
        phone = ${updates.phone ?? current.phone},
        name = ${updates.name ?? current.name},
        password = ${updates.password ?? current.password},
        plan = ${updates.plan ?? current.plan},
        is_active = ${updates.isActive ?? current.is_active},
        expires_at = ${updates.expiresAt ? new Date(updates.expiresAt).toISOString() : current.expires_at},
        store_slug = ${updates.storeSlug ?? current.store_slug},
        sector = ${updates.sector ?? current.sector},
        email_verified = ${updates.emailVerified ?? current.email_verified},
        phone_verified = ${updates.phoneVerified ?? current.phone_verified},
        payment_method_id = ${updates.paymentMethodId ?? current.payment_method_id}
      WHERE id = ${userId}
    `;
    
    return true;
  } catch (error) {
    console.error('Error updating user in DB:', error);
    return false;
  }
}
