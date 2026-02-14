import { NextRequest, NextResponse } from 'next/server';
import { getProductsByStoreSlugFromDB } from '@/lib/db/products';
import { getStoreFromDB } from '@/lib/db/stores';
import { getUserByStoreSlugFromDB, getUserByIdFromDB } from '@/lib/db/users';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Slug user ID olabilir (/m/user_xxx) veya store slug (/m/armin)
    let owner = slug.startsWith('user_')
      ? await getUserByIdFromDB(slug)
      : await getUserByStoreSlugFromDB(slug);

    let products = await getProductsByStoreSlugFromDB(owner?.storeSlug || slug);
    let store = await getStoreFromDB(owner?.storeSlug || slug);

    if (!store && owner?.storeSlug) {
      store = await getStoreFromDB(owner.storeSlug);
    }
    if (!owner && store) {
      owner = await getUserByStoreSlugFromDB(store.slug);
    }
    if (!owner && !store && !slug.startsWith('user_')) {
      products = await getProductsByStoreSlugFromDB(slug);
      store = await getStoreFromDB(slug);
      owner = await getUserByStoreSlugFromDB(slug);
    }

    if (products.length === 0 && owner?.storeSlug) {
      products = await getProductsByStoreSlugFromDB(owner.storeSlug);
      if (!store) store = await getStoreFromDB(owner.storeSlug);
    }

    // 7 günlük deneme bitmiş mi? trial + (expiresAt yok VEYA geçmiş) → menü kapalı
    let trialExpired = false;
    if (owner?.plan === 'trial') {
      const now = new Date();
      const hasExpired = !owner.expiresAt || new Date(owner.expiresAt) <= now;
      if (hasExpired) {
        trialExpired = true;
        products = [];
      }
    }

    const storeNotFound = !owner && !store;

    const res = NextResponse.json({
      success: true,
      products,
      store,
      trialExpired,
      storeNotFound,
    });
    res.headers.set('Cache-Control', 'no-store, max-age=0');
    return res;
  } catch (error: any) {
    console.error('Error in /api/menu/[slug]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
