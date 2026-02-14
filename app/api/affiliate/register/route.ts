import { NextRequest, NextResponse } from 'next/server';
import { registerAffiliate } from '@/lib/affiliate';
import { hashPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Ad, e-posta ve şifre gerekli' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Şifre en az 6 karakter olmalı' },
        { status: 400 }
      );
    }
    const passwordHash = await hashPassword(password);
    const codeInput = body.code != null ? String(body.code).trim() : undefined;
    const ibanInput = body.iban != null ? String(body.iban).trim() : undefined;
    const paymentNameInput = body.payment_name != null ? String(body.payment_name).trim() : undefined;
    const result = await registerAffiliate({
      name: String(name),
      email: String(email),
      passwordHash,
      code: codeInput || undefined,
      iban: ibanInput || null,
      payment_name: paymentNameInput || null,
    });
    if ('error' in result) {
      const messages: Record<string, string> = {
        email_taken: 'Bu e-posta adresi zaten kayıtlı',
        code_taken: 'Bu referans kodu başka biri tarafından kullanılıyor',
        code_invalid: 'Referans kodu 3-24 karakter, sadece harf, rakam ve alt çizgi kullanın',
      };
      return NextResponse.json(
        { success: false, error: messages[result.error] || result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, code: result.code, affiliateId: result.id });
  } catch (e) {
    console.error('Affiliate register error:', e);
    return NextResponse.json({ success: false, error: 'Kayıt yapılamadı' }, { status: 500 });
  }
}
