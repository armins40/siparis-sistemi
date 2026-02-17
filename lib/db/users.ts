// Database functions for Users
import { sql } from './client';
import { deleteStoreFromDB } from './stores';
import type { User } from '@/lib/types';

async function ensureInvoiceColumns() {
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_tax_no TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_address TEXT`;
  } catch (e) {
    console.warn('ensureInvoiceColumns:', e);
  }
}

async function ensureAgreementColumns() {
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS hizmet_sozlesmesi_onay BOOLEAN`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS kvkk_onay BOOLEAN`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS iade_onay BOOLEAN`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onay_tarihi TIMESTAMP`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_adresi TEXT`;
  } catch (e) {
    console.warn('ensureAgreementColumns:', e);
  }
}

export async function getUserByIdFromDB(userId: string): Promise<User | null> {
  try {
    await ensureInvoiceColumns();
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
        payment_method_id as "paymentMethodId",
        referred_by_affiliate_id as "referredByAffiliateId",
        invoice_tax_no as "invoiceTaxNo",
        invoice_address as "invoiceAddress"
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
        payment_method_id as "paymentMethodId",
        referred_by_affiliate_id as "referredByAffiliateId"
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
        payment_method_id as "paymentMethodId",
        referred_by_affiliate_id as "referredByAffiliateId"
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
        payment_method_id as "paymentMethodId",
        referred_by_affiliate_id as "referredByAffiliateId"
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
    // Check if email or phone already exists (for deleted users, they should be gone, but double-check)
    if (user.email) {
      const existingByEmail = await getUserByEmailFromDB(user.email);
      if (existingByEmail && existingByEmail.id !== user.id) {
        console.warn('⚠️ Email already exists:', user.email, 'for user:', existingByEmail.id);
        throw new Error('Email already exists');
      }
    }
    
    if (user.phone) {
      const existingByPhone = await getUserByPhoneFromDB(user.phone);
      if (existingByPhone && existingByPhone.id !== user.id) {
        console.warn('⚠️ Phone already exists:', user.phone, 'for user:', existingByPhone.id);
        throw new Error('Phone already exists');
      }
    }
    
    // Hash password if provided and not already hashed
    let hashedPassword = user.password || null;
    if (hashedPassword && !hashedPassword.startsWith('$2')) {
      const { hashPassword } = await import('@/lib/password');
      hashedPassword = await hashPassword(hashedPassword);
    }
    
    await ensureInvoiceColumns();
    await ensureAgreementColumns();

    const u = user as User & {
      invoiceTaxNo?: string;
      invoiceAddress?: string;
      hizmetSozlesmesiOnay?: boolean;
      kvkkOnay?: boolean;
      iadeOnay?: boolean;
      onayTarihi?: string;
      ipAdresi?: string;
    };

    await sql`
      INSERT INTO users (
        id, email, phone, name, password,
        plan, is_active, created_at, expires_at,
        store_slug, sector,
        email_verified, phone_verified, payment_method_id,
        referred_by_affiliate_id,
        invoice_tax_no, invoice_address,
        hizmet_sozlesmesi_onay, kvkk_onay, iade_onay, onay_tarihi, ip_adresi
      ) VALUES (
        ${user.id},
        ${user.email || null},
        ${user.phone || null},
        ${user.name || null},
        ${hashedPassword},
        ${user.plan || 'trial'},
        ${user.isActive || false},
        ${user.createdAt || new Date().toISOString()},
        ${user.expiresAt || null},
        ${user.storeSlug || null},
        ${user.sector || null},
        ${user.emailVerified || false},
        ${user.phoneVerified || false},
        ${user.paymentMethodId || null},
        ${user.referredByAffiliateId || null},
        ${u.invoiceTaxNo || null},
        ${u.invoiceAddress || null},
        ${u.hizmetSozlesmesiOnay ?? null},
        ${u.kvkkOnay ?? null},
        ${u.iadeOnay ?? null},
        ${u.onayTarihi || new Date().toISOString()},
        ${u.ipAdresi || null}
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
        payment_method_id = EXCLUDED.payment_method_id,
        referred_by_affiliate_id = COALESCE(EXCLUDED.referred_by_affiliate_id, users.referred_by_affiliate_id),
        invoice_tax_no = COALESCE(EXCLUDED.invoice_tax_no, users.invoice_tax_no),
        invoice_address = COALESCE(EXCLUDED.invoice_address, users.invoice_address),
        hizmet_sozlesmesi_onay = COALESCE(EXCLUDED.hizmet_sozlesmesi_onay, users.hizmet_sozlesmesi_onay),
        kvkk_onay = COALESCE(EXCLUDED.kvkk_onay, users.kvkk_onay),
        iade_onay = COALESCE(EXCLUDED.iade_onay, users.iade_onay),
        onay_tarihi = COALESCE(EXCLUDED.onay_tarihi, users.onay_tarihi),
        ip_adresi = COALESCE(EXCLUDED.ip_adresi, users.ip_adresi)
    `;
    return true;
  } catch (error: any) {
    console.error('❌ Error creating user in DB:', error);
    
    // Re-throw with more context for API route to handle
    if (error?.message?.includes('already exists') || error?.message?.includes('Email') || error?.message?.includes('Phone')) {
      throw error;
    }
    
    // Check for unique constraint violations
    if (error?.code === '23505') {
      if (error?.constraint?.includes('email')) {
        throw new Error('Email already exists');
      } else if (error?.constraint?.includes('phone')) {
        throw new Error('Phone already exists');
      } else if (error?.constraint?.includes('store_slug')) {
        throw new Error('Store slug already exists');
      }
    }
    
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
      // Hash password if provided and not already hashed
      let hashedPassword = updates.password;
      if (hashedPassword && !hashedPassword.startsWith('$2')) {
        const { hashPassword } = await import('@/lib/password');
        hashedPassword = await hashPassword(hashedPassword);
      }
      setParts.push(`password = $${paramIndex}`);
      values.push(hashedPassword);
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
    if (updates.referredByAffiliateId !== undefined) {
      setParts.push(`referred_by_affiliate_id = $${paramIndex}`);
      values.push(updates.referredByAffiliateId);
      paramIndex++;
    }
    if (updates.invoiceTaxNo !== undefined) {
      setParts.push(`invoice_tax_no = $${paramIndex}`);
      values.push(updates.invoiceTaxNo);
      paramIndex++;
    }
    if (updates.invoiceAddress !== undefined) {
      setParts.push(`invoice_address = $${paramIndex}`);
      values.push(updates.invoiceAddress);
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
        payment_method_id = ${updates.paymentMethodId ?? current.payment_method_id},
        referred_by_affiliate_id = ${updates.referredByAffiliateId !== undefined ? updates.referredByAffiliateId : current.referred_by_affiliate_id},
        invoice_tax_no = ${updates.invoiceTaxNo !== undefined ? updates.invoiceTaxNo : current.invoice_tax_no},
        invoice_address = ${updates.invoiceAddress !== undefined ? updates.invoiceAddress : current.invoice_address}
      WHERE id = ${userId}
    `;
    
    return true;
  } catch (error) {
    console.error('Error updating user in DB:', error);
    return false;
  }
}

export async function deleteUserFromDB(userId: string): Promise<boolean> {
  try {
    // Get user info before deletion for logging
    const userInfo = await sql`SELECT email, phone, store_slug FROM users WHERE id = ${userId}`;
    const userData = userInfo.rows[0];
    
    // First, delete all orders for this user (since orders has ON DELETE SET NULL, we need to delete manually)
    try {
      await sql`DELETE FROM orders WHERE user_id = ${userId}`;
    } catch (orderError) {
      // Continue even if orders deletion fails
    }
    
    // Delete subscriptions for this user
    try {
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
    } catch (subError) {
      // Continue even if subscriptions deletion fails
    }

    // Affiliate: bu kullanıcıya ait veya bu kullanıcıyı referans eden komisyon kayıtları
    try {
      await sql`DELETE FROM affiliate_commissions WHERE affiliate_id = ${userId} OR referred_user_id = ${userId}`;
    } catch {
      // Tablo yoksa veya hata olursa devam et
    }

    // Push tokens (PWA bildirim)
    try {
      await sql`DELETE FROM push_tokens WHERE user_id = ${userId}`;
    } catch {
      // Tablo yoksa devam et
    }

    const storeSlug = userData?.store_slug as string | undefined;

    // Delete user (products user_id ile CASCADE silinir)
    const deleteResult = await sql`DELETE FROM users WHERE id = ${userId}`;
    
    if (deleteResult.rowCount === 0) {
      console.warn('⚠️ No user found to delete with id:', userId);
      return false;
    }

    // Mağazayı sil — categories, store_slug’lu ürünler CASCADE
    if (storeSlug && storeSlug.trim()) {
      try {
        await deleteStoreFromDB(storeSlug.trim());
      } catch (storeErr) {
        console.warn('⚠️ Store delete failed (may not exist):', storeErr);
      }
    }
    
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting user from DB:', error);
    return false;
  }
}
