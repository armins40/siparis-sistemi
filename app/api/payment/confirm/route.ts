import { NextRequest, NextResponse } from 'next/server';
import { completePaymentIntent, failPaymentIntent, getActiveSubscription } from '@/lib/subscription';
import { updateUser } from '@/lib/admin';
import { getSetting } from '@/lib/db/settings';
import { getUserByIdFromDB } from '@/lib/db/users';
import { createSubscriptionInDB } from '@/lib/db/subscriptions';
import { createAffiliateCommission } from '@/lib/affiliate';
import { createAffiliateNotification } from '@/lib/affiliate-analytics';
import type { User } from '@/lib/types';

export async function POST(request: NextRequest) {
  let paymentIntentId: string | undefined;
  
  try {
    const body = await request.json();
    const { paymentIntentId: intentId, paymentMethod, userId, plan, amount } = body;
    paymentIntentId = intentId;

    if (!paymentIntentId || !userId) {
      return NextResponse.json(
        { error: 'Payment intent ID ve kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    // TODO: Stripe'dan ödeme durumunu kontrol et
    // Production'da:
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (intent.status !== 'succeeded') {
      failPaymentIntent(paymentIntentId);
      return NextResponse.json(
        { error: 'Ödeme başarısız' },
        { status: 400 }
      );
    }
    */

    // Şimdilik mock olarak başarılı kabul ediyoruz
    const completedIntent = completePaymentIntent(paymentIntentId, paymentMethod);
    
    if (!completedIntent) {
      return NextResponse.json(
        { error: 'Ödeme intent bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının aboneliğini güncelle
    const subscription = getActiveSubscription(userId);
    if (subscription) {
      const endDate = new Date(subscription.endDate);
      updateUser(userId, {
        plan: subscription.plan,
        expiresAt: endDate.toISOString(),
        isActive: true,
        paymentMethodId: paymentMethod,
      } as Partial<User>);
      // Admin paneli için DB'ye de kaydet (ses + fatura takibi)
      await createSubscriptionInDB(
        userId,
        subscription.plan,
        subscription.amount,
        paymentIntentId,
        paymentMethod
      ).catch(() => {});
    }

    // Affiliate komisyonu: KDV sonrası tutar üzerinden (yıllık %20, aylık %10)
    const dbUser = await getUserByIdFromDB(userId);
    const affiliateId = dbUser?.referredByAffiliateId;
    const planForCommission = plan || subscription?.plan;
    const amountGross = typeof amount === 'number' && amount > 0 ? amount : subscription?.amount;
    if (affiliateId && planForCommission && amountGross) {
      const kdvRate = parseFloat((await getSetting('kdv_rate')) || '20') || 20;
      await createAffiliateCommission({
        affiliateId,
        referredUserId: userId,
        plan: planForCommission as 'monthly' | '6month' | 'yearly',
        amountGross,
        kdvRate,
        paymentType: 'first',
      });
      await createAffiliateNotification(
        affiliateId,
        'new_sale',
        'Yeni satış geldi',
        `${planForCommission} paket satışı kaydedildi. Komisyonunuz 7 gün güvenlik süresi sonrası çekilebilir olacak.`
      ).catch(() => {});
    }

    return NextResponse.json(
      { 
        message: 'Ödeme başarılı',
        subscription,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Payment confirmation error:', error);
    if (paymentIntentId) {
      failPaymentIntent(paymentIntentId);
    }
    return NextResponse.json(
      { error: 'Ödeme onaylanırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
