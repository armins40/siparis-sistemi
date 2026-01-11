import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, isEmailOrPhoneVerified } from '@/lib/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, code, type } = body;

    // Type kontrolü
    if (type !== 'email' && type !== 'phone') {
      return NextResponse.json(
        { error: 'Geçersiz doğrulama tipi' },
        { status: 400 }
      );
    }

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Doğrulama kodu 6 haneli olmalıdır' },
        { status: 400 }
      );
    }

    const emailOrPhone = type === 'email' ? email : phone;

    if (!emailOrPhone) {
      return NextResponse.json(
        { error: type === 'email' ? 'E-posta adresi gerekli' : 'Telefon numarası gerekli' },
        { status: 400 }
      );
    }

    // Kodu doğrula
    const isValid = verifyCode(emailOrPhone, code, type);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş doğrulama kodu' },
        { status: 400 }
      );
    }

    // Doğrulanmış mı kontrol et
    const isVerified = isEmailOrPhoneVerified(emailOrPhone, type);

    return NextResponse.json(
      { 
        message: 'Doğrulama başarılı',
        verified: isVerified,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verification verify error:', error);
    return NextResponse.json(
      { error: 'Doğrulama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
