'use client';
import { useState, useEffect } from 'react';
import type { GraphicContent, TemplateId } from '@/types';
import Icon from '@/components/ui/Icon';
import Peaks from '@/components/ui/Peaks';

const C = {
  navy: '#011836', navyMid: '#0F1F3D', navyDark: '#182943',
  gold: '#C9A84C', goldCta: '#D1BB74', goldMuted: '#7E7756',
  cream: '#FAF8F3', beige: '#F5EDDB', white: '#FFFFFF',
};

// Curated Unsplash photo IDs by wellness theme
// Format: images.unsplash.com/photo-{ID}?w=1080&h=1080&fit=crop&crop=entropy
const WELLNESS_PHOTOS: Record<string, string[]> = {
  sauna: [
    'photo-1540555700478-4be289fbecef', // woman in steam/warmth, ethereal
    'photo-1556742049-0cfed4f6a45d', // warm spa room
    'photo-1573883431205-98b5f615d6f8', // infrared light, warm glow
  ],
  cryo: [
    'photo-1571019613454-1cb2f99b2d8b', // woman in spa, clean white
    'photo-1515377905703-c4788e51af15', // wellness, cool tones
    'photo-1544161515-4ab6ce6db874', // clinical, professional
  ],
  'red-light': [
    'photo-1559757148-5c350d0d3c56', // glowing skin, beauty
    'photo-1512621776951-a57141f2eefd', // skincare, face glow
    'photo-1570172619644-dfd03ed5d881', // facial treatment
  ],
  iv: [
    'photo-1576091160399-112ba8d25d1d', // medical/clinical clean
    'photo-1559757175-5700dde675bc', // wellness clinic
    'photo-1571019613454-1cb2f99b2d8b', // wellness professional
  ],
  nad: [
    'photo-1559757175-5700dde675bc', // energized, vitality
    'photo-1516975080664-ed2fc6a32937', // IV/medical clean
    'photo-1576091160550-2173dba999ef', // clinical wellness
  ],
  weight: [
    'photo-1571019614242-c5c5dee9f50b', // athletic woman, confident
    'photo-1476480221304-6b5574f8d8e5', // fit, healthy lifestyle
    'photo-1518611012118-696072aa579a', // confident body, wellness
  ],
  pain: [
    'photo-1544161515-4ab6ce6db874', // massage therapy, back
    'photo-1506126613408-eca07ce68773', // relief, spa stones
    'photo-1600334129128-685c5582fd35', // therapeutic, calm
  ],
  healing: [
    'photo-1571019614242-c5c5dee9f50b', // recovery, stretching
    'photo-1559757175-5700dde675bc', // healing, clinical
    'photo-1600585154340-be6161a56a0c', // wellness, restoration
  ],
  energy: [
    'photo-1519823551278-64ac92734fb1', // glowing, radiant woman
    'photo-1571019613454-1cb2f99b2d8b', // vibrant, wellness
    'photo-1559757148-5c350d0d3c56', // skin glow, energy
  ],
  aesthetics: [
    'photo-1570172619644-dfd03ed5d881', // facial aesthetics
    'photo-1512621776951-a57141f2eefd', // clean skin, beauty
    'photo-1559757148-5c350d0d3c56', // glow treatment
  ],
  general: [
    'photo-1571019613454-1cb2f99b2d8b', // elegant spa woman
    'photo-1506126613408-eca07ce68773', // spa, tranquil
    'photo-1515377905703-c4788e51af15', // wellness center
    'photo-1544161515-4ab6ce6db874', // professional treatment
  ],
};

const SERVICE_PHOTO_KEY: Record<string, string> = {
  'Infrared Sauna': 'sauna',
  'Cryotherapy': 'cryo',
  'Red Light Therapy': 'red-light',
  'IV Drip Therapy': 'iv',
  'IV Infusions': 'iv',
  'NAD+ IV': 'nad',
  'NAD+ IM': 'nad',
  'Semaglutide': 'weight',
  'Tirzepatide': 'weight',
  'Compression Therapy': 'healing',
  'HBOT / mHBOT': 'healing',
  'Microneedling': 'aesthetics',
  'Facials': 'aesthetics',
  'Cryo Facial': 'aesthetics',
  'Botox': 'aesthetics',
  'Dermal Fillers': 'aesthetics',
};

const AUDIENCE_PHOTO_KEY: Record<string, string> = {
  pain: 'pain',
  healing: 'healing',
  weight: 'weight',
  energy: 'energy',
};

export function getWellnessPhotos(service: string, audience: string, seed = 0): string[] {
  const key = SERVICE_PHOTO_KEY[service] || AUDIENCE_PHOTO_KEY[audience] || 'general';
  const pool = WELLNESS_PHOTOS[key] || WELLNESS_PHOTOS.general;
  const idx = Math.abs(seed) % pool.length;
  // Return primary + fallback
  const ordered = [pool[idx], ...pool.filter((_, i) => i !== idx)];
  return ordered.map(id => `https://images.unsplash.com/${id}?w=1080&h=1080&fit=crop&crop=entropy&auto=format&q=80`);
}

interface EditHandle { on: boolean; set: (field: string, val: string) => void; }

function StripePlaceholder({ label = 'ADD PHOTO' }: { label?: string }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `repeating-linear-gradient(135deg,${C.navyDark} 0 32px,${C.navyMid} 32px 64px)`,
      display: 'grid', placeItems: 'center',
    }}>
      <div style={{
        fontFamily: "'Inter',sans-serif", fontSize: 28, letterSpacing: '.18em',
        color: 'rgba(209,187,116,.55)', border: '2px dashed rgba(209,187,116,.35)',
        padding: '20px 36px', borderRadius: 12,
      }}>{label}</div>
    </div>
  );
}

function SmartImage({ srcs, style, pos }: { srcs: string[] | null; style?: React.CSSProperties; pos?: { x: number; y: number } }) {
  const [i, setI] = useState(0);
  const firstSrc = srcs?.[0];
  useEffect(() => { setI(0); }, [firstSrc]); // eslint-disable-line react-hooks/set-state-in-effect
  if (!srcs || i >= srcs.length) return <StripePlaceholder />;
  const objectPosition = pos ? `${pos.x}% ${pos.y}%` : '50% 35%';
  return (
    <img
      src={srcs[i]}
      onError={() => setI(v => v + 1)}
      crossOrigin="anonymous"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition, ...style }}
      alt=""
    />
  );
}

function Logo({ size = 72, bright }: { size?: number; bright?: boolean }) {
  return (
    <img
      src="/foothill-logo.png"
      alt="Foothill Wellness"
      style={{
        height: size,
        borderRadius: size * 0.1,
        display: 'block',
        filter: bright ? 'brightness(0) invert(1)' : undefined,
        opacity: bright ? 0.9 : 1,
      }}
    />
  );
}

function PhoneBar({ light }: { light?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 48px',
      background: light ? C.cream : C.navy,
      borderTop: `3px solid ${C.gold}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          width: 40, height: 40, borderRadius: '50%',
          background: light ? C.navy : C.gold,
          color: light ? C.gold : C.navy,
          display: 'grid', placeItems: 'center', flex: 'none',
        }}>
          <Icon n="phone" size={20} />
        </span>
        <div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '.14em', color: light ? C.goldMuted : C.goldCta, textTransform: 'uppercase' }}>Call or Text</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 26, color: light ? C.navy : '#fff', letterSpacing: '.01em' }}>(801) 784-0095</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!light && <Logo size={52} />}
        {light && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 17, color: C.gold, lineHeight: 1.2 }}>Your body already knows how to heal.</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '.1em', color: C.navyMid, marginTop: 2 }}>WE HELP IT HEAL FASTER.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function EdText({ e, field, tag = 'div', multi, style, children }: {
  e?: EditHandle; field: string; tag?: 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'span';
  multi?: boolean; style?: React.CSSProperties; children?: React.ReactNode;
}) {
  const editable = e?.on;
  const shared = {
    className: editable ? 'ged' : undefined,
    contentEditable: editable || undefined,
    suppressContentEditableWarning: true,
    spellCheck: false,
    onBlur: editable ? (ev: React.FocusEvent<HTMLElement>) => {
      const t = ev.currentTarget.innerText.replace(/\s+\n/g, '\n').trim();
      if (t && e?.set) e.set(field, t);
    } : undefined,
    onKeyDown: editable && !multi ? (ev: React.KeyboardEvent) => {
      if (ev.key === 'Enter') { ev.preventDefault(); (ev.currentTarget as HTMLElement).blur(); }
    } : undefined,
    style,
  };
  if (tag === 'h1') return <h1 {...shared}>{children}</h1>;
  if (tag === 'h2') return <h2 {...shared}>{children}</h2>;
  if (tag === 'h3') return <h3 {...shared}>{children}</h3>;
  if (tag === 'h4') return <h4 {...shared}>{children}</h4>;
  if (tag === 'p') return <p {...shared}>{children}</p>;
  if (tag === 'blockquote') return <blockquote {...shared}>{children}</blockquote>;
  if (tag === 'span') return <span {...shared}>{children}</span>;
  return <div {...shared}>{children}</div>;
}

function hookParts(hook: string, emphasis?: string) {
  if (!emphasis) return [{ t: hook, em: false }];
  const i = hook.toLowerCase().indexOf(emphasis.toLowerCase());
  if (i < 0) return [{ t: hook, em: false }];
  return [
    { t: hook.slice(0, i), em: false },
    { t: hook.slice(i, i + emphasis.length), em: true },
    { t: hook.slice(i + emphasis.length), em: false },
  ];
}

function Hook({ hook, emphasis, size, color = C.white, emColor = C.goldCta, e }: {
  hook: string; emphasis?: string; size: number; color?: string; emColor?: string; e?: EditHandle;
}) {
  return (
    <h2
      className={e?.on ? 'ged' : undefined}
      contentEditable={e?.on || undefined}
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={e?.on ? (ev: React.FocusEvent<HTMLElement>) => {
        const t = ev.currentTarget.innerText.trim();
        if (t && e.set) e.set('hook', t);
      } : undefined}
      onKeyDown={e?.on ? (ev: React.KeyboardEvent) => {
        if (ev.key === 'Enter') { ev.preventDefault(); (ev.currentTarget as HTMLElement).blur(); }
      } : undefined}
      style={{
        fontFamily: "'Playfair Display',serif",
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.0,
        color,
        margin: 0,
        letterSpacing: '-.02em',
      }}
    >
      {hookParts(hook, emphasis).map((p, i) => (
        <span key={i} style={p.em ? { fontStyle: 'italic', color: emColor } : undefined}>{p.t}</span>
      ))}
    </h2>
  );
}

// ─── TEMPLATE 1: EDITORIAL (replaces "Educate") ───────────────────────────────
// Right-heavy photo column + clean left info column
// Inspired by their Botox/NeveSkin posts
function TplEducate({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const benefits = (c.benefits || []).slice(0, 5);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* LEFT — info column */}
        <div style={{ width: '52%', padding: '40px 36px 28px 52px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Logo */}
          <Logo size={56} />

          {/* Service title + tagline */}
          <div>
            <EdText e={e} field="title" tag="h1" style={{
              fontFamily: "'Playfair Display',serif",
              fontWeight: 800,
              fontSize: c.title?.length > 14 ? 48 : 58,
              lineHeight: .94,
              color: C.navyMid,
              textTransform: 'uppercase',
              letterSpacing: '-.02em',
              margin: 0,
            }}>{c.title}</EdText>
            <div style={{ height: 3, width: 52, background: `linear-gradient(90deg,${C.gold},${C.goldCta})`, borderRadius: 2, margin: '12px 0 10px' }} />
            <EdText e={e} field="tagline" style={{
              fontFamily: "'Inter',sans-serif",
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: C.goldMuted,
            }}>{c.tagline}</EdText>
          </div>

          {/* Problem */}
          <div style={{ background: C.beige, borderRadius: 12, padding: '18px 20px', borderLeft: `5px solid ${C.gold}` }}>
            <EdText e={e} field="problemHook" tag="p" style={{
              fontFamily: "'Playfair Display',serif",
              fontWeight: 700,
              fontSize: 21,
              lineHeight: 1.2,
              color: C.navyMid,
              margin: 0,
            }}>
              {hookParts(c.problemHook, c.problemEmphasis).map((p, i) => (
                <span key={i} style={p.em ? { fontStyle: 'italic', color: C.gold } : undefined}>{p.t}</span>
              ))}
            </EdText>
            <EdText e={e} field="problemDesc" multi tag="p" style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: 16,
              lineHeight: 1.45,
              color: '#5a6273',
              margin: '8px 0 0',
            }}>{c.problemDesc}</EdText>
          </div>

          {/* Benefits */}
          <div>
            <div style={{
              fontFamily: "'Inter',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: C.navyMid,
              marginBottom: 12,
            }}>{c.title} can help with:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 34, height: 34, flex: 'none',
                    borderRadius: '50%',
                    background: C.navy,
                    display: 'grid', placeItems: 'center',
                    color: C.goldCta,
                  }}>
                    <Icon n={b[0]} size={17} sw={1.8} />
                  </span>
                  <EdText e={e} field={`benefit:${i}`} style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 17,
                    fontWeight: 500,
                    color: C.navyMid,
                    lineHeight: 1.2,
                  }}>{b[1]}</EdText>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — photo column */}
        <div style={{ flex: 1, position: 'relative', background: C.navyDark }}>
          {img ? <SmartImage srcs={img} pos={pos} /> : <StripePlaceholder />}
          {/* subtle inner shadow on left edge to blend with cream */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,rgba(250,248,243,.15) 0%,transparent 18%)',
            pointerEvents: 'none',
          }} />
          {/* Speed badge */}
          <div style={{
            position: 'absolute', bottom: 24, left: 18, right: 18,
            background: 'rgba(1,24,54,.82)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
            border: `1px solid rgba(209,187,116,.25)`,
          }}>
            <span style={{ color: C.goldCta, flex: 'none' }}><Icon n="bolt" size={24} sw={1.6} /></span>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase' }}>FEEL BETTER. FASTER.</div>
              <EdText e={e} field="speed" style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>{c.speed}</EdText>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <PhoneBar light />
    </div>
  );
}

// ─── TEMPLATE 2: STATEMENT (Bold text on navy) ────────────────────────────────
// Inspired by their "EXHAUSTED? NOT YOURSELF?" post — very bold, minimal
function TplStatement({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const hookLen = c.hook?.length || 0;
  const fontSize = hookLen > 50 ? 76 : hookLen > 35 ? 90 : 108;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse 90% 70% at 15% 20%,rgba(24,41,67,.9),transparent 60%),
                   radial-gradient(ellipse 70% 80% at 90% 80%,rgba(12,28,54,.8),transparent 55%),
                   linear-gradient(155deg,${C.navy},${C.navyMid})`,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top: eyebrow + hook */}
      <div style={{ flex: 1, padding: '72px 72px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
        {/* Decorative peaks top-right */}
        <div style={{ position: 'absolute', top: 48, right: 48, opacity: .12 }}>
          <Peaks color={C.goldCta} w={160} />
        </div>

        <EdText e={e} field="eyebrow" style={{
          fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 20,
          letterSpacing: '.24em', textTransform: 'uppercase',
          color: C.goldCta, marginBottom: 22, whiteSpace: 'nowrap',
        }}>{c.eyebrow}</EdText>

        <Hook hook={c.hook} emphasis={c.emphasis} size={fontSize} e={e} />
      </div>

      {/* Gold rule */}
      <div style={{ height: 3, background: `linear-gradient(90deg,${C.gold},${C.goldCta},transparent)`, margin: '0 72px' }} />

      {/* Middle: subhook + inset photo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 36, padding: '36px 72px', flex: '0 0 auto' }}>
        <EdText e={e} field="subhook" multi tag="p" style={{
          fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 30,
          lineHeight: 1.45, color: 'rgba(255,255,255,.82)', margin: 0, flex: 1,
          maxWidth: 580,
        }}>{c.subhook}</EdText>

        {/* Small inset portrait photo */}
        {img && (
          <div style={{
            width: 200, height: 240, flex: 'none',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            border: `2px solid rgba(209,187,116,.3)`,
            boxShadow: '0 20px 50px rgba(0,0,0,.4)',
          }}>
            <SmartImage srcs={img} pos={pos} />
          </div>
        )}
      </div>

      {/* Bottom: logo + CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 72px 52px',
      }}>
        <Logo size={72} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: C.goldCta, color: C.navy,
          padding: '16px 28px', borderRadius: 999,
          fontSize: 24, fontWeight: 700,
          fontFamily: "'Inter',sans-serif",
          boxShadow: '0 8px 24px rgba(0,0,0,.25)',
        }}>
          <Icon n="phone" size={22} />
          {c.ctaShort || '(801) 784-0095'}
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 3: PROOF (Clean testimonial) ───────────────────────────────────
function TplProof({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const quoteLen = c.quote?.length || 0;
  const qSize = quoteLen > 200 ? 38 : quoteLen > 150 ? 44 : 52;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column' }}>
      {/* Top photo strip */}
      <div style={{ height: '38%', position: 'relative', background: C.navyDark, flexShrink: 0 }}>
        {img ? <SmartImage srcs={img} pos={pos} /> : <StripePlaceholder />}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg,rgba(1,24,54,.35) 0%,rgba(1,24,54,.6) 100%)',
        }} />
        {/* Logo + eyebrow overlay */}
        <div style={{ position: 'absolute', top: 36, left: 48, right: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Logo size={58} />
          <EdText e={e} field="eyebrow" style={{
            fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 17,
            letterSpacing: '.2em', textTransform: 'uppercase',
            color: C.goldCta,
          }}>{c.eyebrow || 'Real Client Story'}</EdText>
        </div>
        {/* Large quote mark */}
        <div style={{
          position: 'absolute', bottom: -40, left: 48,
          fontFamily: "'Playfair Display',serif",
          fontSize: 200, lineHeight: 1,
          color: C.goldCta,
          height: 80,
        }}>&ldquo;</div>
      </div>

      {/* Quote block */}
      <div style={{ flex: 1, padding: '56px 56px 28px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <EdText e={e} field="quote" multi tag="blockquote" style={{
          fontFamily: "'Playfair Display',serif",
          fontStyle: 'italic',
          fontSize: qSize,
          lineHeight: 1.28,
          color: C.navyMid,
          margin: 0,
          letterSpacing: '-.01em',
          borderLeft: `5px solid ${C.gold}`,
          paddingLeft: 32,
        }}>{c.quote}</EdText>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
          <div>
            <EdText e={e} field="proofName" style={{
              fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 26, color: C.navy,
            }}>{c.proofName}</EdText>
            <EdText e={e} field="proofMeta" style={{
              fontFamily: "'Inter',sans-serif", fontWeight: 500, fontSize: 19, color: C.goldMuted, marginTop: 4,
            }}>{c.proofMeta}</EdText>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ color: C.gold, fontSize: 28 }}>★</span>
            ))}
          </div>
        </div>
      </div>

      <PhoneBar light />
    </div>
  );
}

// ─── TEMPLATE 4: PHOTO (Full-bleed lifestyle) ────────────────────────────────
function TplPhoto({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const hookLen = c.hook?.length || 0;
  const hSize = hookLen > 45 ? 74 : hookLen > 30 ? 88 : 102;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy }}>
      {img ? <SmartImage srcs={img} pos={pos} /> : <StripePlaceholder />}

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(1,24,54,.55) 0%,
          rgba(1,24,54,.1) 28%,
          rgba(1,24,54,.05) 45%,
          rgba(1,24,54,.5) 68%,
          rgba(1,24,54,.96) 100%)`,
      }} />

      {/* Top: logo */}
      <div style={{ position: 'absolute', top: 48, left: 48, right: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo size={68} />
        <EdText e={e} field="eyebrow" style={{
          fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 19,
          letterSpacing: '.22em', textTransform: 'uppercase',
          color: C.goldCta,
        }}>{c.eyebrow}</EdText>
      </div>

      {/* Bottom: hook + CTA */}
      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 64 }}>
        <Hook hook={c.hook} emphasis={c.emphasis} size={hSize} e={e} />

        <div style={{ height: 3, width: 64, background: C.goldCta, borderRadius: 2, margin: '24px 0' }} />

        <EdText e={e} field="subhook" multi tag="p" style={{
          fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 27,
          lineHeight: 1.45, color: 'rgba(255,255,255,.85)', margin: '0 0 30px',
          maxWidth: 720,
        }}>{c.subhook}</EdText>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: C.goldCta, color: C.navy,
          padding: '18px 32px', borderRadius: 999,
          fontSize: 26, fontWeight: 700,
          fontFamily: "'Inter',sans-serif",
        }}>
          <Icon n="phone" size={22} />
          Call or text (801) 784-0095
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 5: EDITORIAL SPLIT ─────────────────────────────────────────────
// Inspired by their "PEPTIDES?" post — photo left, structured info right
function TplEditorial({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const hookLen = c.hook?.length || 0;
  const hSize = hookLen > 40 ? 68 : 84;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>

      {/* Top band: navy full-width */}
      <div style={{
        background: `linear-gradient(150deg,${C.navy},${C.navyMid})`,
        flex: '0 0 auto',
        padding: '44px 60px 40px',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 28, right: 48, opacity: .1 }}>
          <Peaks color={C.goldCta} w={180} />
        </div>
        <EdText e={e} field="eyebrow" style={{
          fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 19,
          letterSpacing: '.24em', textTransform: 'uppercase',
          color: C.goldCta, marginBottom: 18,
        }}>{c.eyebrow}</EdText>
        <Hook hook={c.hook} emphasis={c.emphasis} size={hSize} e={e} />
      </div>

      {/* Gold divider */}
      <div style={{ height: 5, background: `linear-gradient(90deg,${C.gold},${C.goldCta},${C.gold})`, flexShrink: 0 }} />

      {/* Bottom: photo left + info right */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Photo */}
        <div style={{ width: '44%', position: 'relative', background: C.navyDark }}>
          {img ? <SmartImage srcs={img} pos={pos} /> : <StripePlaceholder />}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,transparent 75%,rgba(250,248,243,.08))',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, background: C.cream, padding: '36px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <EdText e={e} field="subhook" multi tag="p" style={{
              fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: 25,
              lineHeight: 1.5, color: C.navyMid, margin: 0,
            }}>{c.subhook}</EdText>

            <div style={{ height: 2, width: 40, background: C.gold, margin: '20px 0' }} />

            {/* Benefits (3 items for space) */}
            {(c.benefits || []).slice(0, 3).map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: C.navy, color: C.goldCta,
                  display: 'grid', placeItems: 'center', flex: 'none',
                }}>
                  <Icon n={b[0]} size={18} />
                </span>
                <EdText e={e} field={`benefit:${i}`} style={{
                  fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 500, color: C.navyMid,
                }}>{b[1]}</EdText>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <Logo size={56} />
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: C.navy, color: C.goldCta,
              padding: '14px 22px', borderRadius: 999,
              fontSize: 21, fontWeight: 700,
              fontFamily: "'Inter',sans-serif",
            }}>
              <Icon n="phone" size={19} />
              (801) 784-0095
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: 'educate', name: 'Editorial' },
  { id: 'statement', name: 'Bold' },
  { id: 'proof', name: 'Proof' },
  { id: 'photo', name: 'Photo' },
  { id: 'editorial', name: 'Split' },
];

interface GraphicCanvasProps {
  tpl: TemplateId;
  content: GraphicContent;
  img?: string | string[] | null;
  imgPos?: { x: number; y: number };
  edit?: EditHandle;
}

export default function GraphicCanvas({ tpl, content, img, imgPos, edit }: GraphicCanvasProps) {
  const srcs = img ? (Array.isArray(img) ? img : [img]) : null;
  const props = { c: content, img: srcs, pos: imgPos, e: edit };
  if (tpl === 'statement') return <TplStatement {...props} />;
  if (tpl === 'proof') return <TplProof {...props} />;
  if (tpl === 'photo') return <TplPhoto {...props} />;
  if (tpl === 'editorial') return <TplEditorial {...props} />;
  return <TplEducate {...props} />;
}
