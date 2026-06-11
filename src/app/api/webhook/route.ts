import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

async function uploadToBlob(dataUrl: string): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { put } = await import('@vercel/blob');
    const [meta, base64] = dataUrl.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
    const ext = mime.includes('jpeg') ? 'jpg' : 'png';
    const buffer = Buffer.from(base64, 'base64');
    const blob = await put(`fw-post-${Date.now()}.${ext}`, buffer, {
      access: 'public',
      contentType: mime,
    });
    return blob.url;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { webhookUrl, payload } = await req.json();
  if (!webhookUrl) return NextResponse.json({ ok: false, error: 'No webhook URL' }, { status: 400 });

  // Upload image to get a public URL (required by Instagram Zapier action)
  let imageUrl: string | null = null;
  if (payload.imageBase64) {
    imageUrl = await uploadToBlob(payload.imageBase64);
  }

  // Build a complete payload with every field Zapier might need
  const fullPayload = {
    // ── Image ──────────────────────────────────────────────────────
    image_url: imageUrl,                          // Instagram "Photo URL" field
    photo_url: imageUrl,                          // Google My Business "Photo URL" field
    image_base64: payload.imageBase64,            // fallback if no Blob token

    // ── Caption / Text ────────────────────────────────────────────
    caption: payload.fullCaption,                 // Instagram "Caption" field (caption + hashtags)
    post_text: payload.fullCaption,               // Google My Business "Post Text" field
    caption_only: payload.caption,                // caption without hashtags
    hashtags: payload.hashtags,                   // hashtags only
    full_caption: payload.fullCaption,            // same as caption, extra alias

    // ── Business Info ─────────────────────────────────────────────
    business_name: 'Foothill Wellness',
    business_phone: '(801) 784-0095',
    business_website: 'foothillwellness.com',
    business_address: '1414 S Foothill Dr #D, Salt Lake City, UT',

    // ── Post Meta ─────────────────────────────────────────────────
    platform: payload.platform,
    service: payload.service,
    timestamp: payload.timestamp,
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload),
    });
    const text = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, body: text, imageUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
