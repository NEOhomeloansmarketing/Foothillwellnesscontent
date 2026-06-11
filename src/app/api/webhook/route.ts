import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { webhookUrl, payload } = await req.json();
  if (!webhookUrl) return NextResponse.json({ ok: false, error: 'No webhook URL' }, { status: 400 });

  const body = {
    image_url:       payload.imageUrl,
    photo_url:       payload.imageUrl,
    caption:         payload.fullCaption,
    post_text:       payload.fullCaption,
    caption_only:    payload.caption,
    hashtags:        payload.hashtags,
    full_caption:    payload.fullCaption,
    service:         payload.service,
    business_name:   'Foothill Wellness',
    business_phone:  '(801) 784-0095',
    business_website:'foothillwellness.com',
    business_address:'1414 S Foothill Dr #D, Salt Lake City, UT',
    platform:        payload.platform ?? 'instagram',
    timestamp:       payload.timestamp,
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return NextResponse.json({ ok: res.status >= 200 && res.status < 300, status: res.status, body: text });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
