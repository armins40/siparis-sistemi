import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailFromDB, getUserByPhoneFromDB } from '@/lib/db/users';
import { verifyPassword } from '@/lib/password';
import { loginRateLimit } from '@/lib/rate-limit';
import { isValidEmail, isValidPhone, isValidPassword } from '@/lib/validation';

async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrPhone, password, type } = body;

    // Input validation
    if (!emailOrPhone || !password || !type) {
      return NextResponse.json(
        { success: false, error: 'E-posta/telefon ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error || 'Geçersiz şifre' },
        { status: 400 }
      );
    }

    // Validate email/phone format
    if (type === 'email' && !isValidEmail(emailOrPhone)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz e-posta formatı' },
        { status: 400 }
      );
    }
    
    if (type === 'phone' && !isValidPhone(emailOrPhone)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz telefon numarası formatı' },
        { status: 400 }
      );
    }

    // Normalize et
    const normalizedEmailOrPhone = type === 'email' 
      ? emailOrPhone.trim().toLowerCase() 
      : emailOrPhone.trim();

    let user = null;

    // Önce database'den dene
    try {
      if (type === 'email') {
        user = await getUserByEmailFromDB(normalizedEmailOrPhone);
      } else {
        user = await getUserByPhoneFromDB(normalizedEmailOrPhone);
      }
    } catch (error) {
      console.error('Database user fetch failed:', error);
    }

    // Database'de bulunamadıysa null döndür (localStorage kontrolü client-side'da yapılacak)
    // Çünkü localStorage server-side'da erişilebilir değil
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'E-posta adresi veya şifre hatalı' },
        { status: 404 }
      );
    }

    // Şifre kontrolü (hash'lenmiş veya plain text)
    if (user.password) {
      // Check if password is hashed (starts with $2)
      const isHashed = user.password.startsWith('$2');
      
      if (isHashed) {
        // Verify against hash
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: 'E-posta adresi veya şifre hatalı' },
            { status: 401 }
          );
        }
      } else {
        // Legacy plain text password (migrate to hash on next update)
        if (user.password !== password) {
          return NextResponse.json(
            { success: false, error: 'E-posta adresi veya şifre hatalı' },
            { status: 401 }
          );
        }
        // TODO: Hash the password and update in database
      }
    } else {
      // Şifresi olmayan kullanıcılar için
      return NextResponse.json(
        { success: false, error: 'E-posta adresi veya şifre hatalı' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.' },
        { status: 403 }
      );
    }

    // Başarılı - user bilgilerini döndür (şifre hariç)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return loginRateLimit(request, handleLogin);
}
