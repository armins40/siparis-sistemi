import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, PLAN_PRICES } from '@/lib/subscription';
import { isEmailOrPhoneVerified } from '@/lib/verification';
import type { User } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan, amount, email, phone } = body;

    // Validasyon
    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'Kullanıcı ID ve plan gerekli' },
        { status: 400 }
      );
    }

    if (!['monthly', '6month', 'yearly'].includes(plan)) {
      return NextResponse.json(
        { error: 'Geçersiz plan' },
        { status: 400 }
      );
    }

    // Email veya telefon doğrulaması kontrolü
    let verified = false;
    if (email) {
      verified = isEmailOrPhoneVerified(email, 'email');
    } else if (phone) {
      verified = isEmailOrPhoneVerified(phone, 'phone');
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'E-posta veya telefon numaranızı doğrulamanız gerekiyor' },
        { status: 400 }
      );
    }

    // Payment intent oluştur (amount KDV dahil toplam olabilir)
    const amountNum = typeof amount === 'number' && amount > 0 ? amount : undefined;
    const paymentIntent = createPaymentIntent(userId, plan, amountNum);

    // TODO: Stripe entegrasyonu
    // Production'da Stripe Payment Intent oluşturulmalı:
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: PLAN_PRICES[plan] * 100, // Kuruş cinsinden
      currency: 'try',
      metadata: {
        userId,
        plan,
      },
    });
    */

    return NextResponse.json(
      { 
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        plan: paymentIntent.plan,
        // Stripe client secret (production'da):
        // clientSecret: intent.client_secret,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Ödeme intent oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
