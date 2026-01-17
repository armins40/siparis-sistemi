import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, isEmailOrPhoneVerified, getVerificationCodesArray } from '@/lib/verification';

export async function POST(request: NextRequest) {
  try {
    let body;
    let rawBody;
    try {
      rawBody = await request.text();
      console.log('📥 Raw request body:', rawBody);
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Request body parse error:', parseError);
      console.error('Raw body:', rawBody);
      return NextResponse.json(
        { error: 'Geçersiz istek formatı', details: process.env.NODE_ENV === 'development' ? String(parseError) : undefined },
        { status: 400 }
      );
    }
    
    const { email, phone, code, type } = body;
    
    console.log('📥 Verification verify request:', { email, phone, code, type, body });

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

    console.log('📧 Normalized email/phone:', { emailOrPhone, originalEmail: email, originalPhone: phone, type });

    if (!emailOrPhone) {
      console.error('❌ Email/Phone missing:', { email, phone, type });
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
    
    // Debug için detaylı log
    if (!isValid) {
      console.log('❌ Verification failed:', {
        emailOrPhone,
        normalizedCode,
        originalCode: code,
        type,
        timestamp: new Date().toISOString(),
      });
      
      // Tüm kodları kontrol et (debug için)
      const codes = getVerificationCodesArray();
      const matchingCodes = codes.filter(c => {
        if (c.type !== type) return false;
        const codeValue = type === 'email' ? c.email : c.phone;
        if (!codeValue) return false;
        return type === 'email' 
          ? codeValue.toLowerCase() === emailOrPhone
          : codeValue === emailOrPhone;
      });
      console.log('📋 Matching codes for', emailOrPhone, ':', matchingCodes.map(c => ({
        code: c.code,
        expiresAt: c.expiresAt,
        verified: c.verified,
        createdAt: c.createdAt,
        email: c.email,
        phone: c.phone,
      })));
    }

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
