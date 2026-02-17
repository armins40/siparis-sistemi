import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { hashPassword } from '@/lib/password';
import { updateUserInDB } from '@/lib/db/users';
import { getUserByEmailFromDB } from '@/lib/db/users';
import { isValidPassword } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !token.trim()) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş link. Lütfen şifre sıfırlama talebini tekrar gönderin.' },
        { status: 400 }
      );
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || 'Geçersiz şifre' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const result = await sql`
      SELECT id, email, expires_at, used_at
      FROM password_reset_tokens
      WHERE token = ${token.trim()}
        AND used_at IS NULL
        AND expires_at > ${now}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş link. Lütfen şifre sıfırlama talebini tekrar gönderin.' },
        { status: 400 }
      );
    }

    const row = result.rows[0];
    const email = row.email as string;

    const user = await getUserByEmailFromDB(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    const hashedPassword = await hashPassword(password);
    await updateUserInDB(user.id, { password: hashedPassword });

    await sql`
      UPDATE password_reset_tokens
      SET used_at = ${now}
      WHERE id = ${row.id}
    `;

    return NextResponse.json({
      message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
