import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { dataUrl } = await req.json();
  if (!dataUrl) return NextResponse.json({ ok: false, error: 'No dataUrl provided' }, { status: 400 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, error: 'BLOB_READ_WRITE_TOKEN not configured' }, { status: 500 });
  }

  try {
    const [meta, base64] = dataUrl.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
    const ext = mime.includes('jpeg') ? 'jpg' : 'png';
    const buffer = Buffer.from(base64, 'base64');

    const blob = await put(`fw-post-${Date.now()}.${ext}`, buffer, {
      access: 'public',
      contentType: mime,
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
