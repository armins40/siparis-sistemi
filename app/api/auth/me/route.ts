import { NextRequest, NextResponse } from 'next/server';
import { getUserByIdFromDB } from '@/lib/db/users';

/** GET /api/auth/me?userId=xxx — DB'den güncel kullanıcı (plan, expiresAt dahil). Şifre dönmez. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await getUserByIdFromDB(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { password: _p, ...safe } = user as typeof user & { password?: string };
    return NextResponse.json({ success: true, user: safe });
  } catch (error: any) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
