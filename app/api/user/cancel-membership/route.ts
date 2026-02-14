import { NextRequest, NextResponse } from 'next/server';
import { getUserByIdFromDB, updateUserInDB } from '@/lib/db/users';

/**
 * POST /api/user/cancel-membership
 * Body: { userId: string }
 * Üyeliği iptal eder: plan = 'free' yapılır, expiresAt aynı kalır (dönem sonuna kadar erişim devam eder).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body?.userId;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'userId gerekli' },
        { status: 400 }
      );
    }

    const user = await getUserByIdFromDB(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const paidPlans = ['trial', 'monthly', '6month', 'yearly'];
    if (!paidPlans.includes(user.plan)) {
      return NextResponse.json(
        { success: false, error: 'İptal edilecek aktif üyelik bulunamadı' },
        { status: 400 }
      );
    }

    const ok = await updateUserInDB(userId, { plan: 'free' });
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'İptal işlemi kaydedilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Üyeliğiniz iptal edildi. Ödenen dönem sonuna kadar hizmetten yararlanmaya devam edebilirsiniz.',
    });
  } catch (error: any) {
    console.error('Cancel membership error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
