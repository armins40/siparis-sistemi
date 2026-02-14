import { NextRequest, NextResponse } from 'next/server';
import { savePushToken } from '@/lib/db/push-tokens';
import { getUserByIdFromDB } from '@/lib/db/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userId } = body as { token?: string; userId?: string };

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'token is required' },
        { status: 400 }
      );
    }
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const claimedUserId = userId.trim();
    const user = await getUserByIdFromDB(claimedUserId);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ok = await savePushToken(claimedUserId, token.trim());
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to save token' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error('POST /api/save-token:', e);
    return NextResponse.json(
      { success: false, error: (e as Error)?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
