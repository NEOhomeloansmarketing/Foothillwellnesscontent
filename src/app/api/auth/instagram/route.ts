import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const appId = process.env.INSTAGRAM_APP_ID;
  if (!appId) return NextResponse.json({ error: 'INSTAGRAM_APP_ID not set' }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const redirectUri = `${origin}/api/auth/instagram/callback`;

  const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement');
  url.searchParams.set('response_type', 'code');

  return NextResponse.redirect(url.toString());
}
