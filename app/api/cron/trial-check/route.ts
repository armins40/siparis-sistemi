import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sipariş Sistemi <onboarding@resend.dev>';

export const maxDuration = 60;

async function ensureTrialColumns() {
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_reminder_sent_at TIMESTAMP`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_expired_sent_at TIMESTAMP`;
  } catch (e) {
    console.warn('ensureTrialColumns:', e);
  }
}

export async function GET(request: NextRequest) {
  // CRON_SECRET ile doğrula (Vercel otomatik gönderir)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureTrialColumns();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const todayEndISO = todayEnd.toISOString();
    const tomorrowStartISO = tomorrowStart.toISOString();
    const tomorrowEndISO = tomorrowEnd.toISOString();

    let remindersSent = 0;
    let expiredSent = 0;

    // 1) Deneme yarın bitiyor → hatırlatma maili
    const reminderUsers = await sql`
      SELECT id, email, name, store_slug, expires_at
      FROM users
      WHERE plan = 'trial'
        AND expires_at IS NOT NULL
        AND expires_at >= ${tomorrowStartISO}
        AND expires_at <= ${tomorrowEndISO}
        AND trial_reminder_sent_at IS NULL
        AND email IS NOT NULL
        AND TRIM(email) != ''
    `;

    for (const row of reminderUsers.rows) {
      const email = (row.email as string)?.trim();
      if (!email || !resend) continue;

      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: 'Sipariş Sistemi – Deneme süreniz yarın sona eriyor',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAFAFA;">
              <div style="background-color: #FFFFFF; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #555555; font-size: 24px; margin-bottom: 20px;">⏰ Deneme Süreniz Yarın Bitiyor</h1>
                <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                  Merhaba${row.name ? ` ${row.name}` : ''},
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                  7 günlük ücretsiz deneme süreniz <strong>yarın</strong> sona erecek. Hizmetten kesintisiz yararlanmaya devam etmek için aboneliğinizi aktifleştirebilirsiniz.
                </p>
                <p style="margin: 24px 0;">
                  <a href="https://siparis-sistemi.com/dashboard" style="display: inline-block; background-color: #FB6602; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Aboneliği Aktifleştir</a>
                </p>
                <p style="color: #999999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #EEEEEE;">
                  Sorularınız için destek@siparis-sistemi.com adresinden bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
          `,
        });
        await sql`UPDATE users SET trial_reminder_sent_at = NOW() WHERE id = ${row.id}`;
        remindersSent++;
      } catch (err) {
        console.error('Trial reminder email error:', row.id, err);
      }
    }

    // 2) Deneme bugün veya geçmişte bitti → süre doldu maili
    const expiredUsers = await sql`
      SELECT id, email, name, store_slug, expires_at
      FROM users
      WHERE plan = 'trial'
        AND expires_at IS NOT NULL
        AND expires_at <= ${todayEndISO}
        AND trial_expired_sent_at IS NULL
        AND email IS NOT NULL
        AND TRIM(email) != ''
    `;

    for (const row of expiredUsers.rows) {
      const email = (row.email as string)?.trim();
      if (!email || !resend) continue;

      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: 'Sipariş Sistemi – Deneme süreniz sona erdi',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAFAFA;">
              <div style="background-color: #FFFFFF; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #555555; font-size: 24px; margin-bottom: 20px;">📋 Deneme Süreniz Sona Erdi</h1>
                <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                  Merhaba${row.name ? ` ${row.name}` : ''},
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                  7 günlük ücretsiz deneme süreniz sona erdi. Sipariş sisteminden kesintisiz yararlanmaya devam etmek için aboneliğinizi aktifleştirebilirsiniz.
                </p>
                <p style="margin: 24px 0;">
                  <a href="https://siparis-sistemi.com/dashboard" style="display: inline-block; background-color: #FB6602; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Aboneliği Aktifleştir</a>
                </p>
                <p style="color: #999999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #EEEEEE;">
                  Sorularınız için destek@siparis-sistemi.com adresinden bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
          `,
        });
        await sql`UPDATE users SET trial_expired_sent_at = NOW() WHERE id = ${row.id}`;
        expiredSent++;
      } catch (err) {
        console.error('Trial expired email error:', row.id, err);
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      expiredSent,
      reminderCount: reminderUsers.rows.length,
      expiredCount: expiredUsers.rows.length,
    });
  } catch (error) {
    console.error('Trial check cron error:', error);
    return NextResponse.json(
      { error: 'Trial check failed', details: String(error) },
      { status: 500 }
    );
  }
}
