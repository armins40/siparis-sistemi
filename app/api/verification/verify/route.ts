import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, isEmailOrPhoneVerified, getVerificationCodesArray } from '@/lib/verification';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      const rawBody = await request.text();
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Request body parse error:', parseError);
      return NextResponse.json(
        { error: 'Geçersiz istek formatı', details: process.env.NODE_ENV === 'development' ? String(parseError) : undefined },
        { status: 400 }
      );
    }
    
    const { email, phone, code, type } = body;

    // Type kontrolü
    if (type !== 'email' && type !== 'phone') {
      return NextResponse.json(
        { error: 'Geçersiz doğrulama tipi' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Doğrulama kodu gerekli' },
        { status: 400 }
      );
    }

    // Email/Phone normalize et
    const emailOrPhone = type === 'email' 
      ? email?.trim().toLowerCase() 
      : phone?.trim();

    if (!emailOrPhone) {
      return NextResponse.json(
        { 
          error: type === 'email' ? 'E-posta adresi gerekli' : 'Telefon numarası gerekli',
          details: process.env.NODE_ENV === 'development' ? { receivedEmail: email, receivedPhone: phone, type } : undefined,
        },
        { status: 400 }
      );
    }

    // Kodu normalize et (sadece rakamlar)
    const normalizedCode = code.toString().trim().replace(/\D/g, '');
    
    if (normalizedCode.length !== 6) {
      return NextResponse.json(
        { error: 'Doğrulama kodu 6 haneli olmalıdır' },
        { status: 400 }
      );
    }

    // Kodu doğrula
    const isValid = verifyCode(emailOrPhone, normalizedCode, type);

    if (!isValid) {
      return NextResponse.json(
        { 
          error: 'Geçersiz veya süresi dolmuş doğrulama kodu',
          details: process.env.NODE_ENV === 'development' ? {
            emailOrPhone,
            codeLength: normalizedCode.length,
            type,
          } : undefined,
        },
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
    console.error('❌ Verification verify error:', error);
    return NextResponse.json(
      { error: 'Doğrulama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
