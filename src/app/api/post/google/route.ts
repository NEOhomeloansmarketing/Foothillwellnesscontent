import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

async function refreshGoogleToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to refresh Google token');
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const { imageUrl, caption, locationName, accessToken, refreshToken } = await req.json();

  if (!caption || !locationName || !accessToken) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  let token = accessToken;

  try {
    const body: Record<string, unknown> = {
      languageCode: 'en-US',
      summary: caption.slice(0, 1500),
      callToAction: { actionType: 'CALL', url: 'tel:+18017840095' },
      topicType: 'STANDARD',
    };

    if (imageUrl) {
      body.media = [{ mediaFormat: 'PHOTO', sourceUrl: imageUrl }];
    }

    let res = await fetch(`https://mybusiness.googleapis.com/v4/${locationName}/localPosts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Try token refresh once on 401
    if (res.status === 401 && refreshToken) {
      token = await refreshGoogleToken(refreshToken);
      res = await fetch(`https://mybusiness.googleapis.com/v4/${locationName}/localPosts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    const data = await res.json();
    if (!data.name) throw new Error(data.error?.message || 'Failed to create post');

    return NextResponse.json({ ok: true, postName: data.name, newToken: token !== accessToken ? token : undefined });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
