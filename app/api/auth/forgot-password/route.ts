import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { Resend } from 'resend';
import { getUserByEmailFromDB } from '@/lib/db/users';
import { isValidEmail } from '@/lib/validation';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sipariş Sistemi <onboarding@resend.dev>';

const TOKEN_EXPIRY_MINUTES = 60;

async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email)`;
  } catch (e) {
    console.warn('ensureTable password_reset_tokens:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta formatı' },
        { status: 400 }
      );
    }

    await ensureTable();

    // Kullanıcı var mı ve e-posta ile kayıtlı mı?
    const user = await getUserByEmailFromDB(normalizedEmail);
    if (!user) {
      // Güvenlik: Kullanıcı yoksa da aynı mesaj dön (email enumeration önleme)
      return NextResponse.json(
        { message: 'E-posta adresinize şifre sıfırlama linki gönderdik. E-postanızı kontrol edin.' },
        { status: 200 }
      );
    }

    if (!user.password) {
      // Şifresi olmayan kullanıcı (eski kayıt)
      return NextResponse.json(
        { message: 'E-posta adresinize şifre sıfırlama linki gönderdik. E-postanızı kontrol edin.' },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const id = `pr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await sql`
      INSERT INTO password_reset_tokens (id, email, token, expires_at)
      VALUES (${id}, ${normalizedEmail}, ${token}, ${expiresAt.toISOString()})
    `;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || request.headers.get('origin')
      || 'https://siparis-sistemi.com';
    const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

    if (resend) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: normalizedEmail,
          subject: 'Sipariş Sistemi – Şifre Sıfırlama',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAFAFA;">
              <div style="background-color: #FFFFFF; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #555555; font-size: 24px; margin-bottom: 20px;">🔐 Şifre Sıfırlama</h1>
                <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                  Merhaba${user.name ? ` ${user.name}` : ''},
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                  Şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
                </p>
                <p style="margin: 24px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background-color: #FB6602; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Şifremi Sıfırla</a>
                </p>
                <p style="color: #555555; font-size: 14px; line-height: 1.6;">
                  Bu link <strong>${TOKEN_EXPIRY_MINUTES} dakika</strong> geçerlidir.
                </p>
                <p style="color: #999999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #EEEEEE;">
                  Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin. Şifreniz değişmeyecektir.
                </p>
              </div>
            </div>
          `,
          text: `Şifre Sıfırlama\n\nŞifrenizi sıfırlamak için bu linke tıklayın: ${resetUrl}\n\nBu link ${TOKEN_EXPIRY_MINUTES} dakika geçerlidir.`,
        });
      } catch (emailErr: unknown) {
        console.error('Forgot password email error:', emailErr);
        await sql`DELETE FROM password_reset_tokens WHERE id = ${id}`;
        return NextResponse.json(
          { error: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
          { status: 500 }
        );
      }
    } else {
      await sql`DELETE FROM password_reset_tokens WHERE id = ${id}`;
      return NextResponse.json(
        { error: 'E-posta servisi yapılandırılmamış' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'E-posta adresinize şifre sıfırlama linki gönderdik. E-postanızı kontrol edin.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
