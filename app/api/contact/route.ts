import { NextRequest, NextResponse } from 'next/server';

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

    // In production, you would send an email using a service like:
    // - Resend (resend.com)
    // - SendGrid (sendgrid.com)
    // - Nodemailer with SMTP
    // - AWS SES
    // 
    // For now, we'll create the email content and log it
    // You can integrate with your preferred email service
    
    const emailContent = {
      to: 'admin@siparis-sistemi.com',
      from: email,
      subject: `İletişim Formu: ${subject}`,
      html: `
        <h2>Yeni İletişim Formu Mesajı</h2>
        <p><strong>Ad Soyad:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Konu:</strong> ${subject}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      text: `
        Yeni İletişim Formu Mesajı
        Ad Soyad: ${name}
        E-posta: ${email}
        Konu: ${subject}
        Mesaj: ${message}
      `,
    };

    // TODO: Replace this with actual email service integration
    // Example with Resend (install: npm install resend):
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'admin@siparis-sistemi.com',
      replyTo: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    */


    // Return success response
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
