import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { imageUrl, caption, igUserId, accessToken } = await req.json();

  if (!imageUrl || !caption || !igUserId || !accessToken) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Step 1: Create media container
    const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken }),
    });
    const container = await containerRes.json();
    if (!container.id) throw new Error(container.error?.message || 'Failed to create media container');

    // Step 2: Publish
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: container.id, access_token: accessToken }),
    });
    const published = await publishRes.json();
    if (!published.id) throw new Error(published.error?.message || 'Failed to publish');

    return NextResponse.json({ ok: true, postId: published.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
