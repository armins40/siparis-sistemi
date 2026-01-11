import { NextRequest, NextResponse } from 'next/server';
import { completePaymentIntent, failPaymentIntent, getActiveSubscription } from '@/lib/subscription';
import { updateUser } from '@/lib/admin';
import type { User } from '@/lib/types';

export async function POST(request: NextRequest) {
  let paymentIntentId: string | undefined;
  
  try {
    const body = await request.json();
    const { paymentIntentId: intentId, paymentMethod, userId } = body;
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
