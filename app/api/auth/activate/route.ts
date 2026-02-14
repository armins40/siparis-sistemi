import { NextRequest, NextResponse } from 'next/server';
import { updateUserInDB } from '@/lib/db/users';

/** Doğrulama sonrası kullanıcıyı aktifleştir (isActive, emailVerified, phoneVerified) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, emailVerified, phoneVerified } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId gerekli' },
        { status: 400 }
      );
    }

    const updates: { isActive: boolean; emailVerified?: boolean; phoneVerified?: boolean } = {
      isActive: true,
    };
    if (emailVerified !== undefined) updates.emailVerified = !!emailVerified;
    if (phoneVerified !== undefined) updates.phoneVerified = !!phoneVerified;

    const ok = await updateUserInDB(userId, updates);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/auth/activate:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
