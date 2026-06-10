import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error_description');
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  if (error || !code) {
    return NextResponse.redirect(`${origin}?ig_error=${encodeURIComponent(error || 'Auth cancelled')}`);
  }

  const appId = process.env.INSTAGRAM_APP_ID!;
  const appSecret = process.env.INSTAGRAM_APP_SECRET!;
  const redirectUri = `${origin}/api/auth/instagram/callback`;

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error(tokenData.error?.message || 'No token');

    // Exchange for long-lived token
    const llRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`);
    const llData = await llRes.json();
    const longToken = llData.access_token || tokenData.access_token;

    // Get Facebook Pages this user manages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${longToken}`);
    const pagesData = await pagesRes.json();
    const page = pagesData.data?.[0];
    if (!page) throw new Error('No Facebook Page found — make sure your Instagram is connected to a Facebook Page');

    const pageToken = page.access_token;

    // Get connected Instagram Business Account
    const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${pageToken}`);
    const igData = await igRes.json();
    const igId = igData.instagram_business_account?.id;
    if (!igId) throw new Error('No Instagram Business account linked to this page');

    // Get Instagram username
    const igInfoRes = await fetch(`https://graph.facebook.com/v19.0/${igId}?fields=username&access_token=${pageToken}`);
    const igInfo = await igInfoRes.json();
    const username = igInfo.username || 'Instagram';

    const params = new URLSearchParams({
      ig_connected: '1',
      ig_token: pageToken,
      ig_id: igId,
      ig_name: `@${username}`,
    });
    return NextResponse.redirect(`${origin}?${params}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.redirect(`${origin}?ig_error=${encodeURIComponent(msg)}`);
  }
}
