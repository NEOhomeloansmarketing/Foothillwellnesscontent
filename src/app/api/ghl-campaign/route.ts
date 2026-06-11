import { NextRequest, NextResponse } from 'next/server';
import type { EmailContent } from '@/types';

export const maxDuration = 30;

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    'Content-Type': 'application/json',
    Version: GHL_VERSION,
  };
}

async function ghlPost(path: string, body: unknown) {
  const res = await fetch(`${GHL_BASE}${path}`, {
    method: 'POST',
    headers: ghlHeaders(),
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  console.log(`[ghl] POST ${path} → ${res.status}:`, raw.slice(0, 400));
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(raw); } catch { /* non-JSON */ }
  return { ok: res.ok, status: res.status, data, raw };
}

function buildHtml(ec: EmailContent): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F0EDE6;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 32px rgba(1,24,54,.10);">
      <tr><td style="background:#011836;padding:24px 40px;text-align:center;">
        <div style="font-family:Georgia,serif;font-size:22px;font-weight:800;color:#C9A84C;letter-spacing:.04em;">Foothill Wellness</div>
        <div style="font-size:11px;color:rgba(201,168,76,.65);margin-top:3px;letter-spacing:.12em;text-transform:uppercase;">Feel Better Faster</div>
      </td></tr>
      <tr><td style="padding:32px 40px 24px;color:#1a2540;">
        <p style="font-size:15px;line-height:1.75;margin:0 0 4px;font-weight:600;">Hello {{contact.first_name}},</p>
        <p style="font-size:15px;line-height:1.75;margin:0 0 18px;">${ec.opening.replace(/\n/g, '<br>')}</p>
        <p style="font-size:15px;line-height:1.75;color:#3a4a6a;margin:0 0 20px;">${ec.empathy.replace(/\n/g, '<br>')}</p>
        <div style="border-left:3px solid #C9A84C;border-radius:0 8px 8px 0;background:#FAF8F3;padding:14px 18px;margin-bottom:20px;">
          <p style="font-size:14.5px;line-height:1.7;color:#1a2540;margin:0;">${ec.explanation.replace(/\n/g, '<br>')}</p>
        </div>
        <div style="background:#FAF8F3;border-radius:10px;padding:16px 20px;margin-bottom:20px;border-top:2px solid #C9A84C;">
          <p style="font-family:Georgia,serif;font-style:italic;font-size:14.5px;line-height:1.65;color:#011836;margin:0;">${ec.proof.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="font-size:15px;line-height:1.75;color:#1a2540;margin:0 0 18px;">${ec.speed.replace(/\n/g, '<br>')}</p>
        <p style="font-size:15px;line-height:1.75;color:#3a4a6a;margin:0 0 22px;">${ec.ease.replace(/\n/g, '<br>')}</p>
        <div style="background:#011836;border-radius:10px;padding:16px 22px;margin-bottom:22px;text-align:center;">
          <p style="color:#C9A84C;font-weight:700;font-size:15px;margin:0;">${ec.cta}</p>
        </div>
        <p style="font-size:14px;line-height:1.7;color:#3a4a6a;margin:0 0 16px;white-space:pre-line;">${ec.closing}</p>
        ${ec.ps ? `<hr style="border:none;border-top:1px solid #e8e4da;margin:18px 0 14px;"><p style="font-size:13px;line-height:1.6;color:#6b7a99;font-style:italic;margin:0;">P.S. ${ec.ps}</p>` : ''}
      </td></tr>
      <tr><td style="background:#011836;padding:14px 40px;text-align:center;">
        <p style="font-size:11px;color:rgba(201,168,76,.55);letter-spacing:.06em;margin:0;">Foothill Wellness · 1414 S Foothill Dr, Salt Lake City, UT 84108</p>
        <p style="font-size:10px;color:rgba(201,168,76,.35);margin:4px 0 0;">{{contact.unsubscribe_link}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) {
    return NextResponse.json({ ok: false, error: 'GHL_API_KEY or GHL_LOCATION_ID not configured in Vercel env vars' }, { status: 500 });
  }

  try {
    const { email, title } = await req.json() as { email: EmailContent; title: string };
    const html = buildHtml(email);

    // Step 1: Create email template
    const tmpl = await ghlPost('/emails/templates', {
      locationId,
      name: title || email.subject,
      subject: email.subject,
      html,
    });

    if (!tmpl.ok) {
      return NextResponse.json({
        ok: false,
        error: (tmpl.data?.message as string) || tmpl.raw.slice(0, 200) || `GHL returned ${tmpl.status}`,
        status: tmpl.status,
      }, { status: 502 });
    }

    const templateId = tmpl.data.id as string | undefined;
    return NextResponse.json({ ok: true, templateId, message: 'Email template created in GHL — open Email Marketing to send it.' });

  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
