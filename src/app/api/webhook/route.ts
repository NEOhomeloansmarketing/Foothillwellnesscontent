import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

async function uploadToImgBB(dataUrl: string): Promise<string | null> {
  const key = process.env.IMGBB_API_KEY;
  if (!key) { console.error('IMGBB_API_KEY not set'); return null; }
  try {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const form = new URLSearchParams();
    form.append('key', key);
    form.append('image', base64);
    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form,
    });
    const json = await res.json();
    if (!json.success) throw new Error(JSON.stringify(json.error));
    return json.data.url as string;
  } catch (e) {
    console.error('ImgBB upload error:', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { webhookUrl, payload } = await req.json();
  if (!webhookUrl) return NextResponse.json({ ok: false, error: 'No webhook URL' }, { status: 400 });

  // Upload to ImgBB to get a public URL (required by Instagram)
  let imageUrl: string | null = null;
  if (payload.imageBase64) {
    imageUrl = await uploadToImgBB(payload.imageBase64);
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
    // Zapier returns 2xx on success — treat any 2xx as ok regardless of body
    return NextResponse.json({ ok: res.status >= 200 && res.status < 300, status: res.status, body: text, imageUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
