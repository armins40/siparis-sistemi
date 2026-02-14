import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateByEmail, getAffiliatePasswordHash } from '@/lib/affiliate';
import { verifyPassword } from '@/lib/password';

const AFFILIATE_COOKIE = 'affiliate_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 gün

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-posta ve şifre gerekli' },
        { status: 400 }
      );
    }
    const affiliate = await getAffiliateByEmail(String(email));
    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: 'E-posta veya şifre hatalı' },
        { status: 401 }
      );
    }
    if ((affiliate as { is_suspended?: boolean }).is_suspended) {
      return NextResponse.json(
        { success: false, error: 'Hesabınız askıya alınmış. Destek için iletişime geçin.' },
        { status: 403 }
      );
    }
    const hash = await getAffiliatePasswordHash(affiliate.id);
    if (!hash || !(await verifyPassword(String(password), hash))) {
      return NextResponse.json(
        { success: false, error: 'E-posta veya şifre hatalı' },
        { status: 401 }
      );
    }
    const res = NextResponse.json({
      success: true,
      affiliate: { id: affiliate.id, name: affiliate.name, email: affiliate.email, code: affiliate.code },
    });
    res.cookies.set(AFFILIATE_COOKIE, affiliate.id, { path: '/', maxAge: MAX_AGE, httpOnly: true, sameSite: 'lax' });
    return res;
  } catch (e) {
    console.error('Affiliate login error:', e);
    return NextResponse.json({ success: false, error: 'Giriş yapılamadı' }, { status: 500 });
  }
}
