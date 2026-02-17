import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { hashPassword } from '@/lib/password';
import { createStoreInDB } from '@/lib/db/stores';

const TEST_EMAIL = 'test@siparis-sistemi.com';
const TEST_PASSWORD = 'Test4006';
const TEST_USER_ID = 'user_test_full_access';
const TEST_STORE_SLUG = 'test-store';

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    const hashedPassword = await hashPassword(TEST_PASSWORD);

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    const existing = await sql`
      SELECT id FROM users WHERE email = ${TEST_EMAIL} LIMIT 1
    `;

    if (existing.rows.length > 0) {
      await sql`
        UPDATE users SET
          name = 'Test Kullanıcı',
          password = ${hashedPassword},
          plan = 'yearly',
          is_active = true,
          expires_at = ${expiresAt.toISOString()},
          store_slug = ${TEST_STORE_SLUG},
          email_verified = true
        WHERE email = ${TEST_EMAIL}
      `;
    } else {
      await sql`
        INSERT INTO users (
          id, email, name, password, plan, is_active,
          created_at, expires_at, store_slug, sector,
          email_verified, phone_verified
        ) VALUES (
          ${TEST_USER_ID},
          ${TEST_EMAIL},
          'Test Kullanıcı',
          ${hashedPassword},
          'yearly',
          true,
          NOW(),
          ${expiresAt.toISOString()},
          ${TEST_STORE_SLUG},
          'market',
          true,
          false
        )
      `;
    }

    await createStoreInDB({
      slug: TEST_STORE_SLUG,
      name: 'Test Mağaza',
      sector: 'market',
    });

    return NextResponse.json({
      success: true,
      message: 'Test kullanıcı oluşturuldu / güncellendi',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
  } catch (error) {
    console.error('Seed test user error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
