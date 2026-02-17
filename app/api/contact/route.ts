import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sipariş Sistemi <onboarding@resend.dev>';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const escBr = (s: string) => esc(s).replace(/\n/g, '<br>');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #555555;">Yeni İletişim Formu Mesajı</h2>
        <p><strong>Ad Soyad:</strong> ${esc(name)}</p>
        <p><strong>E-posta:</strong> ${esc(email)}</p>
        <p><strong>Konu:</strong> ${esc(subject)}</p>
        <p><strong>Mesaj:</strong></p>
        <p style="white-space: pre-wrap;">${escBr(message)}</p>
      </div>
    `;

    if (!resend || !process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY bulunamadı - İletişim formu mail gönderilemedi');
      return NextResponse.json(
        { error: 'E-posta servisi yapılandırılmamış. Lütfen daha sonra tekrar deneyin veya destek@siparis-sistemi.com adresine doğrudan yazın.' },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: fromEmail,
      to: 'destek@siparis-sistemi.com',
      replyTo: email.trim(),
      subject: `İletişim Formu: ${subject}`,
      html,
    });

    return NextResponse.json(
      { message: 'Mesajınız başarıyla gönderildi' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
