import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createVerificationCode, getLatestCode } from '@/lib/verification';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, type } = body;

    // Type kontrolü
    if (type !== 'email' && type !== 'phone') {
      return NextResponse.json(
        { error: 'Geçersiz doğrulama tipi' },
        { status: 400 }
      );
    }

    // Email veya telefon kontrolü
    if (type === 'email' && !email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      );
    }

    if (type === 'phone' && !phone) {
      return NextResponse.json(
        { error: 'Telefon numarası gerekli' },
        { status: 400 }
      );
    }

    const emailOrPhone = type === 'email' ? email : phone;

    // Doğrulama kodu oluştur
    const verificationCode = createVerificationCode(emailOrPhone, type);

    // Email gönderme
    if (type === 'email') {
      if (resend && process.env.RESEND_API_KEY) {
        try {
          // Resend ile gerçek mail gönder
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Siparis <noreply@siparis-sistemi.com>',
            to: email,
            subject: 'Siparis - E-posta Doğrulama Kodu',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAFAFA;">
                <div style="background-color: #FFFFFF; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h1 style="color: #555555; font-size: 24px; margin-bottom: 20px;">🔐 E-posta Doğrulama Kodu</h1>
                  <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                    Merhaba,
                  </p>
                  <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                    Siparis sistemine kayıt olmak için doğrulama kodunuz:
                  </p>
                  <div style="background-color: #FB6602; color: #FFFFFF; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; letter-spacing: 8px;">
                    ${verificationCode.code}
                  </div>
                  <p style="color: #555555; font-size: 14px; line-height: 1.6;">
                    Bu kod <strong>12 dakika</strong> geçerlidir.
                  </p>
                  <p style="color: #999999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #EEEEEE;">
                    Bu e-postayı siz talep etmediyseniz, lütfen görmezden gelin.
                  </p>
                </div>
                <p style="text-align: center; color: #999999; font-size: 12px; margin-top: 20px;">
                  © ${new Date().getFullYear()} Siparis Sistemi. Tüm hakları saklıdır.
                </p>
              </div>
            `,
            text: `Siparis - E-posta Doğrulama Kodu\n\nDoğrulama kodunuz: ${verificationCode.code}\n\nBu kod 12 dakika geçerlidir.`,
          });
          console.log(`✅ E-posta başarıyla gönderildi: ${email}`);
        } catch (emailError: any) {
          console.error('❌ E-posta gönderme hatası:', emailError);
          // E-posta gönderme başarısız olsa bile kodu döndür (test modunda)
          // Production'da bu hatayı kullanıcıya göstermek isteyebilirsiniz
        }
      } else {
        // Resend API key yok, sadece log (production'da bu olmamalı)
        console.error('RESEND_API_KEY bulunamadı - Mail gönderilemedi');
      }
    } else {
      // SMS gönderme (henüz entegre edilmedi)
      console.log(`⚠️ SMS gönderme henüz entegre edilmedi`);
      console.log(`📱 Doğrulama kodu (${type}): ${emailOrPhone}`);
      console.log(`🔑 Kod: ${verificationCode.code}`);
    }

    // Başarılı response
    return NextResponse.json(
      { 
        message: type === 'email' 
          ? `Doğrulama kodu ${email} adresine gönderildi`
          : `Doğrulama kodu ${phone} numarasına gönderildi`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verification send error:', error);
    return NextResponse.json(
      { error: 'Doğrulama kodu gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
