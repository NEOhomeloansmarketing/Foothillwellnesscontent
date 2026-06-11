import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 45;

// ── Font loader ──────────────────────────────────────────────────────────────
async function fetchGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const api = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const css = await fetch(api, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  }).then(r => r.text());
  const url = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
  if (!url) throw new Error(`Font not found: ${family} ${weight}`);
  return fetch(url).then(r => r.arrayBuffer());
}

// ── Supabase upload ──────────────────────────────────────────────────────────
async function uploadPng(buffer: ArrayBuffer): Promise<string | null> {
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_KEY;
  if (!supaUrl || !supaKey) return null;
  try {
    const supabase = createClient(supaUrl, supaKey);
    const filename = `fw-post-${Date.now()}.png`;
    const { error } = await supabase.storage
      .from('post-images')
      .upload(filename, Buffer.from(buffer), { contentType: 'image/png', upsert: true });
    if (error) throw error;
    return supabase.storage.from('post-images').getPublicUrl(filename).data.publicUrl;
  } catch (e) {
    console.error('Supabase upload:', e);
    return null;
  }
}

// ── Satori-compatible template render ────────────────────────────────────────
// Satori supports flexbox + absolute positioning. No CSS Grid, no backdrop-filter.
const navy = '#011836';
const gold = '#C9A84C';
const goldCta = '#D1BB74';
const cream = '#FAF8F3';

function renderGraphic(
  tpl: string,
  content: Record<string, unknown>,
  imageBase64: string | null,
) {
  const hook = String(content.hook || '');
  const subhook = String(content.subhook || '');
  const eyebrow = String(content.eyebrow || '');
  const quote = String(content.quote || '');
  const proofName = String(content.proofName || '');
  const tagline = String(content.tagline || '');

  // Universal full-bleed template — readable on Instagram at any size
  const isNavy = tpl === 'photo';
  const bg = isNavy ? navy : navy;

  return (
    <div
      style={{
        width: 1080, height: 1080,
        display: 'flex', flexDirection: 'column',
        backgroundColor: bg, fontFamily: 'Inter', position: 'relative',
      }}
    >
      {/* Background image */}
      {imageBase64 && (
        <img
          src={imageBase64}
          style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, objectFit: 'cover' }}
          alt=""
        />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 1080, height: 1080,
        background: tpl === 'proof'
          ? 'linear-gradient(180deg,rgba(1,24,54,.85) 0%,rgba(1,24,54,.55) 100%)'
          : 'linear-gradient(180deg,rgba(1,24,54,.72) 0%,rgba(1,24,54,.05) 38%,rgba(1,24,54,.0) 50%,rgba(1,24,54,.55) 68%,rgba(1,24,54,.98) 100%)',
        display: 'flex',
      }} />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 44, left: 44, right: 44,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          backgroundColor: 'rgba(1,24,54,0.82)', borderRadius: 14,
          padding: '10px 20px', border: `1px solid rgba(201,168,76,0.3)`,
        }}>
          <div style={{
            fontFamily: 'Playfair Display', fontWeight: 800, fontSize: 18,
            color: '#fff', letterSpacing: '0.06em',
          }}>FOOTHILL WELLNESS</div>
        </div>
        {eyebrow ? (
          <div style={{
            fontWeight: 700, fontSize: 16, letterSpacing: '0.22em',
            color: goldCta, textTransform: 'uppercase',
          }}>{eyebrow}</div>
        ) : null}
      </div>

      {/* Quote template */}
      {tpl === 'proof' ? (
        <div style={{
          position: 'absolute', left: 60, right: 60, top: 200,
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>
          <div style={{ color: goldCta, fontSize: 120, fontFamily: 'Playfair Display', lineHeight: 0.6 }}>&ldquo;</div>
          <div style={{
            fontFamily: 'Playfair Display', fontStyle: 'italic',
            fontSize: quote.length > 180 ? 36 : quote.length > 100 ? 46 : 58,
            lineHeight: 1.3, color: '#fff',
            borderLeft: `4px solid ${gold}`, paddingLeft: 28,
          }}>{quote}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 32 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: goldCta }}>{proofName}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5].map(n => <div key={n} style={{ color: gold, fontSize: 28 }}>★</div>)}
            </div>
          </div>
        </div>
      ) : (
        /* Hook template — works for educate, statement, photo, editorial */
        <div style={{
          position: 'absolute', left: 56, right: 56, bottom: 52,
          display: 'flex', flexDirection: 'column',
        }}>
          {tagline ? (
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', color: gold, marginBottom: 12, textTransform: 'uppercase' }}>{tagline}</div>
          ) : null}
          <div style={{ height: 3, width: 60, backgroundColor: goldCta, borderRadius: 2, marginBottom: 20 }} />
          <div style={{
            fontFamily: 'Playfair Display', fontWeight: 800,
            fontSize: hook.length > 50 ? 66 : hook.length > 30 ? 80 : 96,
            lineHeight: 0.93, color: '#fff', marginBottom: 22, letterSpacing: '-0.02em',
          }}>{hook}</div>
          <div style={{
            fontWeight: 300, fontSize: 26, lineHeight: 1.45,
            color: 'rgba(255,255,255,0.82)', marginBottom: 32,
          }}>{subhook}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            backgroundColor: goldCta, color: navy,
            padding: '16px 32px', borderRadius: 999,
            fontSize: 24, fontWeight: 800, alignSelf: 'flex-start',
          }}>
            Call or text · (801) 784-0095
          </div>
        </div>
      )}

      {/* Footer stripe */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 6,
        backgroundColor: gold,
      }} />
    </div>
  );
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { template, content, imageBase64, caption, hashtags, webhookUrl, download } =
    await req.json();

  // Load fonts
  const [interBold, interLight, playfairBold] = await Promise.all([
    fetchGoogleFont('Inter', 700),
    fetchGoogleFont('Inter', 300),
    fetchGoogleFont('Playfair Display', 800),
  ]).catch(e => { console.error('Font load error:', e); return [null, null, null]; });

  type W = 100|200|300|400|500|600|700|800|900;
  const fonts: { name: string; data: ArrayBuffer; weight: W }[] = [];
  if (interBold)    fonts.push({ name: 'Inter', data: interBold, weight: 700 });
  if (interLight)   fonts.push({ name: 'Inter', data: interLight, weight: 300 });
  if (playfairBold) fonts.push({ name: 'Playfair Display', data: playfairBold, weight: 800 });

  const imageResponse = new ImageResponse(
    renderGraphic(template, content, imageBase64 || null),
    { width: 1080, height: 1080, fonts },
  );

  const buffer = await imageResponse.arrayBuffer();

  // Download-only mode: return PNG directly
  if (download) {
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="foothill-post.png"',
      },
    });
  }

  // Upload to Supabase for public URL
  const imageUrl = await uploadPng(buffer);

  // Post to Zapier
  const fullCaption = `${caption}\n\n${Array.isArray(hashtags) ? hashtags.join(' ') : hashtags}`;
  const zapPayload = {
    image_url: imageUrl,
    photo_url: imageUrl,
    image_base64: `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`,
    caption: fullCaption,
    post_text: fullCaption,
    caption_only: caption,
    hashtags: Array.isArray(hashtags) ? hashtags.join(' ') : hashtags,
    full_caption: fullCaption,
    business_name: 'Foothill Wellness',
    business_phone: '(801) 784-0095',
    business_website: 'foothillwellness.com',
    timestamp: new Date().toISOString(),
  };

  const zapRes = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zapPayload),
  });

  return NextResponse.json({
    ok: zapRes.status >= 200 && zapRes.status < 300,
    imageUrl,
  });
}
