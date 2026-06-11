import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

async function uploadToSupabase(dataUrl: string): Promise<string | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  try {
    const supabase = createClient(url, key);
    const [meta, base64] = dataUrl.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
    const ext = mime.includes('jpeg') ? 'jpg' : 'png';
    const buffer = Buffer.from(base64, 'base64');
    const filename = `fw-post-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('post-images')
      .upload(filename, buffer, { contentType: mime, upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('post-images').getPublicUrl(filename);
    return data.publicUrl;
  } catch (e) {
    console.error('Supabase upload error:', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { webhookUrl, payload } = await req.json();
  if (!webhookUrl) return NextResponse.json({ ok: false, error: 'No webhook URL' }, { status: 400 });

  // Upload image to Supabase Storage to get a public URL (required by Instagram)
  let imageUrl: string | null = null;
  if (payload.imageBase64) {
    imageUrl = await uploadToSupabase(payload.imageBase64);
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
