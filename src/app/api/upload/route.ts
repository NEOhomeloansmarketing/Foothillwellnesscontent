import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

async function uploadViaVercelBlob(dataUrl: string): Promise<string> {
  const { put } = await import('@vercel/blob');
  const [meta, base64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'png';
  const buffer = Buffer.from(base64, 'base64');
  const blob = await put(`fw-post-${Date.now()}.${ext}`, buffer, { access: 'public', contentType: mime });
  return blob.url;
}

async function uploadViaImgBB(dataUrl: string): Promise<string> {
  const key = process.env.IMGBB_API_KEY;
  if (!key) throw new Error('IMGBB_API_KEY not set in Vercel environment variables');
  const base64 = dataUrl.replace(/^data:image\/[\w+]+;base64,/, '');
  const form = new FormData();
  form.append('key', key);
  form.append('image', base64);
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || `ImgBB error: ${JSON.stringify(json)}`);
  return json.data.url as string;
}

export async function POST(req: NextRequest) {
  const { dataUrl } = await req.json();
  if (!dataUrl) return NextResponse.json({ ok: false, error: 'No image data provided' }, { status: 400 });

  // Try Vercel Blob first (same infrastructure, most reliable), fall back to ImgBB
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const url = await uploadViaVercelBlob(dataUrl);
      return NextResponse.json({ ok: true, url, via: 'vercel-blob' });
    } catch (e) {
      console.error('Vercel Blob failed, trying ImgBB:', e);
    }
  }

  try {
    const url = await uploadViaImgBB(dataUrl);
    return NextResponse.json({ ok: true, url, via: 'imgbb' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
