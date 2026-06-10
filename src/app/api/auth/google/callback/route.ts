import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  if (error || !code) {
    return NextResponse.redirect(`${origin}?g_error=${encodeURIComponent(error || 'Auth cancelled')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error(tokenData.error_description || 'No token');

    // Get accounts list
    const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const accountsData = await accountsRes.json();
    const account = accountsData.accounts?.[0];
    if (!account) throw new Error('No Google Business Profile account found');

    // Get first location
    const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const locData = await locRes.json();
    const location = locData.locations?.[0];

    const params = new URLSearchParams({
      g_connected: '1',
      g_token: tokenData.access_token,
      g_refresh: tokenData.refresh_token || '',
      g_account: account.name,
      g_location: location?.name || '',
      g_name: location?.title || account.accountName || 'Google Business',
    });
    return NextResponse.redirect(`${origin}?${params}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.redirect(`${origin}?g_error=${encodeURIComponent(msg)}`);
  }
}
