import { NextRequest, NextResponse } from 'next/server';
import { createUserInDB } from '@/lib/db/users';
import { createStoreInDB } from '@/lib/db/stores';
import { signupRateLimit } from '@/lib/rate-limit';
import { isValidEmail, isValidPhone, isValidPassword, isValidStoreSlug, sanitizeString } from '@/lib/validation';
import type { User, Store } from '@/lib/types';

async function handleSignup(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, store, referralCode } = body;

    // Input validation
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bilgileri gerekli' },
        { status: 400 }
      );
    }

    if (!user.email && !user.phone) {
      return NextResponse.json(
        { success: false, error: 'E-posta veya telefon numarası gerekli' },
        { status: 400 }
      );
    }

    // Validate email
    if (user.email && !isValidEmail(user.email)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz e-posta formatı' },
        { status: 400 }
      );
    }

    // Validate phone
    if (user.phone && !isValidPhone(user.phone)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz telefon numarası formatı' },
        { status: 400 }
      );
    }

    // Validate password if provided
    if (user.password) {
      const passwordValidation = isValidPassword(user.password);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { success: false, error: passwordValidation.error || 'Geçersiz şifre' },
          { status: 400 }
        );
      }
    }

    // Validate store slug
    if (!store || !store.slug) {
      return NextResponse.json(
        { success: false, error: 'Mağaza bilgileri gerekli' },
        { status: 400 }
      );
    }

    const slugValidation = isValidStoreSlug(store.slug);
    if (!slugValidation.valid) {
      return NextResponse.json(
        { success: false, error: slugValidation.error || 'Geçersiz mağaza adı' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    if (user.name) {
      user.name = sanitizeString(user.name, 200);
    }
    if (store.name) {
      store.name = sanitizeString(store.name, 200);
    }

    // Affiliate: ref kodu ile gelen kullanıcıyı affiliate'e bağla
    if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
      const { getAffiliateIdByCode } = await import('@/lib/affiliate');
      const affiliateId = await getAffiliateIdByCode(referralCode.trim());
      if (affiliateId) {
        user.referredByAffiliateId = affiliateId;
      }
    }

    // Check if user already exists in database (by email or phone)
    const { getUserByEmailFromDB, getUserByPhoneFromDB } = await import('@/lib/db/users');
    
    if (user.email) {
      const existingByEmail = await getUserByEmailFromDB(user.email);
      if (existingByEmail) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }
    
    if (user.phone) {
      const existingByPhone = await getUserByPhoneFromDB(user.phone);
      if (existingByPhone) {
        return NextResponse.json(
          { success: false, error: 'Bu telefon numarası zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Save user to database
    try {
      const userSuccess = await createUserInDB(user);
      if (!userSuccess) {
        console.error('❌ Failed to save user to database');
        return NextResponse.json(
          { success: false, error: 'Kullanıcı kaydedilemedi. Lütfen tekrar deneyin.' },
          { status: 500 }
        );
      }
    } catch (userError: any) {
      console.error('❌ Error saving user to database:', userError);
      
      // Check if it's a unique constraint error or already exists error
      if (userError?.message?.includes('Email already exists') || userError?.message?.includes('email')) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        );
      } else if (userError?.message?.includes('Phone already exists') || userError?.message?.includes('phone')) {
        return NextResponse.json(
          { success: false, error: 'Bu telefon numarası zaten kullanılıyor' },
          { status: 400 }
        );
      } else if (userError?.code === '23505') {
        // PostgreSQL unique constraint violation
        if (userError?.constraint?.includes('email')) {
          return NextResponse.json(
            { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' },
            { status: 400 }
          );
        } else if (userError?.constraint?.includes('phone')) {
          return NextResponse.json(
            { success: false, error: 'Bu telefon numarası zaten kullanılıyor' },
            { status: 400 }
          );
        } else if (userError?.constraint?.includes('store_slug')) {
          return NextResponse.json(
            { success: false, error: 'Bu mağaza adı zaten kullanılıyor' },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { success: false, error: userError?.message || 'Kullanıcı kaydedilemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    // Save store to database
    try {
      const storeSuccess = await createStoreInDB(store);
      // Don't fail the whole signup if store fails - user is more important
    } catch (storeError: any) {
      console.error('Error saving store to database:', storeError);
      // Don't fail the whole signup if store fails
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/auth/signup:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return signupRateLimit(request, handleSignup);
}
