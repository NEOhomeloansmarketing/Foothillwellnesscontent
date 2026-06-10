'use client';
import { useState, useEffect } from 'react';
import type { GraphicContent, TemplateId } from '@/types';
import Icon from '@/components/ui/Icon';

const C = {
  navy: '#011836', navyMid: '#0F1F3D',
  gold: '#C9A84C', goldCta: '#D1BB74', goldMuted: '#B8A96A',
  cream: '#FAF8F3', beige: '#F0E8D4',
};

function NoPhoto() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1a2a40', display: 'grid', placeItems: 'center' }}>
      <div style={{ opacity: .35, fontSize: 20, letterSpacing: '.15em', color: C.goldCta, fontFamily: "'Inter',sans-serif" }}>ADD PHOTO</div>
    </div>
  );
}

function Img({ srcs, pos }: { srcs: string[] | null; pos?: { x: number; y: number } }) {
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [srcs?.[0]]);
  if (!srcs || i >= srcs.length) return <NoPhoto />;
  return <img src={srcs[i]} onError={() => setI(v => v + 1)} crossOrigin="anonymous"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos ? `${pos.x}% ${pos.y}%` : '50% 35%' }} alt="" />;
}

function Logo({ h = 42 }: { h?: number; bright?: boolean }) {
  return <img src="/foothill-logo.png" alt="" style={{ height: h, maxWidth: h * 5, objectFit: 'contain', display: 'block', borderRadius: 6 }} />;
}

function Stars({ size = 26 }: { size?: number }) {
  return <div style={{ display: 'flex', gap: 4 }}>{[1,2,3,4,5].map(n => <span key={n} style={{ color: C.gold, fontSize: size }}>★</span>)}</div>;
}

interface EH { on: boolean; set: (f: string, v: string) => void; }

function Ed({ e, f, tag = 'div', multi, s, children }: {
  e?: EH; f: string; tag?: 'div'|'h1'|'h2'|'p'|'blockquote'|'span';
  multi?: boolean; s?: React.CSSProperties; children?: React.ReactNode;
}) {
  const shared = {
    className: e?.on ? 'ged' : undefined,
    contentEditable: e?.on || undefined,
    suppressContentEditableWarning: true, spellCheck: false,
    onBlur: e?.on ? (ev: React.FocusEvent<HTMLElement>) => { const t = ev.currentTarget.innerText.trim(); if (t) e.set(f, t); } : undefined,
    onKeyDown: e?.on && !multi ? (ev: React.KeyboardEvent) => { if (ev.key === 'Enter') { ev.preventDefault(); (ev.currentTarget as HTMLElement).blur(); } } : undefined,
    style: s,
  };
  if (tag === 'h1') return <h1 {...shared}>{children}</h1>;
  if (tag === 'h2') return <h2 {...shared}>{children}</h2>;
  if (tag === 'p') return <p {...shared}>{children}</p>;
  if (tag === 'blockquote') return <blockquote {...shared}>{children}</blockquote>;
  if (tag === 'span') return <span {...shared}>{children}</span>;
  return <div {...shared}>{children}</div>;
}

function hookParts(hook: string, em?: string) {
  if (!em) return [{ t: hook, em: false }];
  const i = hook.toLowerCase().indexOf(em.toLowerCase());
  if (i < 0) return [{ t: hook, em: false }];
  return [{ t: hook.slice(0, i), em: false }, { t: hook.slice(i, i + em.length), em: true }, { t: hook.slice(i + em.length), em: false }];
}

// Font size that keeps hook to ~2–3 lines in a given column width
function hs(len: number, big = 88, small = 52) {
  if (len <= 14) return big;
  if (len >= 55) return small;
  return Math.round(big - (big - small) * (len - 14) / 41);
}

const BENEFIT_ICONS = ['moon', 'bolt', 'drop', 'heart'] as const;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 · Full Bleed Photo
// Big image background, text anchored to bottom, pill CTA — like their cryo post
// ─────────────────────────────────────────────────────────────────────────────
function Tpl1({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const fontSize = hs(c.hook?.length || 0, 96, 58);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy }}>
      <Img srcs={img} pos={pos} />
      {/* gradient: dark top + heavy dark bottom */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(1,24,54,.72) 0%,rgba(1,24,54,.08) 35%,rgba(1,24,54,.0) 50%,rgba(1,24,54,.55) 68%,rgba(1,24,54,.98) 100%)' }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 44, left: 44, right: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ background: 'rgba(1,24,54,.75)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(201,168,76,.2)' }}>
          <Logo h={32} bright />
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: '.04em', lineHeight: 1 }}>FOOTHILL<br />WELLNESS</div>
        </div>
        <Ed e={e} f="eyebrow" s={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '.22em', textTransform: 'uppercase', color: C.goldCta }}>{c.eyebrow}</Ed>
      </div>

      {/* Bottom content */}
      <div style={{ position: 'absolute', left: 56, right: 56, bottom: 52 }}>
        {/* Hook */}
        <Ed e={e} f="hook" tag="h1" s={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: fontSize, lineHeight: .93, color: '#fff', margin: '0 0 20px', letterSpacing: '-.02em' }}>
          {hookParts(c.hook, c.emphasis).map((p, i) => (
            <span key={i} style={p.em ? { fontStyle: 'italic', color: C.goldCta } : undefined}>{p.t}</span>
          ))}
        </Ed>

        <div style={{ height: 3, width: 60, background: C.goldCta, borderRadius: 2, marginBottom: 20 }} />

        {/* Subhook */}
        <Ed e={e} f="subhook" multi tag="p" s={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 26, lineHeight: 1.45, color: 'rgba(255,255,255,.84)', margin: '0 0 30px', maxWidth: 720 }}>{c.subhook}</Ed>

        {/* CTA pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: C.goldCta, color: C.navy, padding: '16px 32px', borderRadius: 999, fontFamily: "'Inter',sans-serif", fontSize: 24, fontWeight: 800 }}>
          <Icon n="phone" size={22} />Call or text (801) 784-0095
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 · Editorial Split
// Left: service, hook, empathy, 4 benefits | Right: photo rounded | Bottom: quote + CTA | Footer
// ─────────────────────────────────────────────────────────────────────────────
function Tpl2({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const fontSize = hs(c.hook?.length || 0, 82, 48);
  const benefits = [...(c.benefits || [])].slice(0, 4);
  while (benefits.length < 4) benefits.push([BENEFIT_ICONS[benefits.length], '']);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Main row */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', padding: '40px 36px 0 44px', gap: 28, overflow: 'hidden' }}>

        {/* Left text */}
        <div style={{ width: '52%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <Ed e={e} f="eyebrow" s={{ fontSize: 17, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldMuted }}>{c.eyebrow}</Ed>
          <div style={{ height: 2, width: 44, background: `linear-gradient(90deg,${C.gold},${C.goldCta})`, borderRadius: 2 }} />

          <Ed e={e} f="hook" tag="h1" s={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: fontSize, lineHeight: .9, color: C.navy, textTransform: 'uppercase', margin: 0, letterSpacing: '-.02em' }}>{c.hook}</Ed>

          <Ed e={e} f="tagline" s={{ fontSize: 19, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.gold }}>{c.tagline}</Ed>

          <Ed e={e} f="problemDesc" multi tag="p" s={{ fontSize: 18, lineHeight: 1.45, color: '#4a556a', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.problemDesc || c.subhook}</Ed>

          {/* 4 benefits */}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: C.navyMid, marginBottom: 12 }}>HOW WE CAN HELP</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, border: `1px solid rgba(201,168,76,.3)`, borderRadius: 14, padding: '14px 10px' }}>
              {benefits.map(([icon, label], i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', border: `1.5px solid ${C.gold}`, display: 'grid', placeItems: 'center', color: C.gold }}>
                    <Icon n={icon || BENEFIT_ICONS[i % 4]} size={22} sw={1.5} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.navyMid, textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right photo */}
        <div style={{ flex: 1, position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#1a2a40', minHeight: 0 }}>
          <Img srcs={img} pos={pos} />
        </div>
      </div>

      {/* Quote + CTA row */}
      <div style={{ display: 'flex', gap: 14, padding: '14px 36px 14px 44px', flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0, background: '#fff', border: `1px solid rgba(201,168,76,.2)`, borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 12 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 56, color: C.gold, lineHeight: .65, flexShrink: 0 }}>&ldquo;</div>
          <div style={{ overflow: 'hidden' }}>
            <Ed e={e} f="quote" multi tag="p" s={{ fontSize: 15, lineHeight: 1.4, color: C.navyMid, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.quote}</Ed>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginTop: 6 }}>– {c.proofName}</div>
          </div>
        </div>
        <div style={{ width: 280, flexShrink: 0, background: C.navy, borderRadius: 14, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.goldCta, marginBottom: 8 }}>READY FOR YOUR OUTCOME?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.gold, display: 'grid', placeItems: 'center', color: C.navy, flexShrink: 0 }}><Icon n="phone" size={18} /></div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', fontWeight: 700 }}>CALL/TEXT</div>
              <div style={{ fontSize: 23, fontWeight: 800, color: '#fff', lineHeight: 1 }}>(801) 784-0095</div>
            </div>
          </div>
          <div style={{ fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,.4)', marginTop: 6 }}>We make it easy. You take the first step.</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: C.navy, padding: '12px 44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, borderTop: `3px solid ${C.gold}`, flexShrink: 0 }}>
        <Logo h={34} bright />
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '.07em' }}>FOOTHILL WELLNESS</div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.2em', color: C.goldCta, textTransform: 'uppercase' }}>FEEL BETTER FASTER</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 · Quote Card
// Image top 38% | Large quote | Stars + attribution | Phone footer
// ─────────────────────────────────────────────────────────────────────────────
function Tpl3({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const qLen = c.quote?.length || 0;
  const qSize = qLen > 200 ? 32 : qLen > 140 ? 38 : qLen > 80 ? 46 : 56;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Image strip */}
      <div style={{ height: '37%', position: 'relative', background: '#1a2a40', flexShrink: 0 }}>
        <Img srcs={img} pos={pos} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(1,24,54,.5) 0%,rgba(1,24,54,.15) 55%,rgba(1,24,54,.6) 100%)' }} />
        {/* Top overlays */}
        <div style={{ position: 'absolute', top: 28, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ background: 'rgba(1,24,54,.8)', backdropFilter: 'blur(6px)', borderRadius: 12, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 9, border: '1px solid rgba(201,168,76,.2)' }}>
            <Logo h={28} bright />
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: '#fff' }}>FOOTHILL WELLNESS</div>
          </div>
          <Ed e={e} f="eyebrow" s={{ fontSize: 14, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldCta }}>{c.eyebrow || 'Real Client Story'}</Ed>
        </div>
      </div>

      {/* Quote body */}
      <div style={{ flex: 1, minHeight: 0, padding: '30px 48px 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Big quote mark */}
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 110, color: C.goldCta, lineHeight: .6, flexShrink: 0, opacity: .6 }}>&ldquo;</div>

        <Ed e={e} f="quote" multi tag="blockquote" s={{
          fontFamily: "'Playfair Display',serif", fontStyle: 'italic',
          fontSize: qSize, lineHeight: 1.3, color: C.navyMid,
          margin: '6px 0 0', paddingLeft: 24, borderLeft: `4px solid ${C.gold}`,
          letterSpacing: '-.01em', flex: 1, overflow: 'hidden',
        }}>{c.quote}</Ed>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexShrink: 0 }}>
          <div>
            <Ed e={e} f="proofName" s={{ fontSize: 21, fontWeight: 700, color: C.navy }}>{c.proofName}</Ed>
            <Ed e={e} f="proofMeta" s={{ fontSize: 15, color: C.goldMuted, marginTop: 3 }}>{c.proofMeta}</Ed>
          </div>
          <Stars size={26} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 48px', borderTop: `1.5px solid rgba(201,168,76,.22)`, marginTop: 14, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.navy, display: 'grid', placeItems: 'center', color: C.goldCta }}><Icon n="phone" size={16} /></div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.goldMuted }}>CALL OR TEXT</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, lineHeight: 1 }}>(801) 784-0095</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 15, color: C.gold, lineHeight: 1.3 }}>Your body already knows how to heal.</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: C.navyMid, marginTop: 1 }}>WE HELP IT HEAL FASTER.</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4 · Bold Navy Statement
// No image needed — pure typography on navy, big hook, subhook, pill CTA
// ─────────────────────────────────────────────────────────────────────────────
function Tpl4({ c, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const fontSize = hs(c.hook?.length || 0, 108, 64);
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(145deg,${C.navy},#0c1f3a)`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Subtle mountain watermark */}
      <svg style={{ position: 'absolute', top: 40, right: 50, opacity: .06 }} width={320} height={200} viewBox="0 0 320 200" fill="none">
        <path d="M10 180 L80 60 L140 120 L210 30 L310 180" stroke={C.goldCta} strokeWidth={3} strokeLinejoin="round" />
      </svg>

      {/* Top */}
      <div style={{ padding: '44px 56px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Logo h={40} bright />
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '.06em' }}>FOOTHILL WELLNESS</div>
        </div>
        <Ed e={e} f="eyebrow" s={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: C.goldCta }}>{c.eyebrow}</Ed>
      </div>

      {/* Center: hook */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', overflow: 'hidden' }}>
        <Ed e={e} f="hook" tag="h1" s={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: fontSize, lineHeight: .92, color: '#fff', margin: '0 0 24px', letterSpacing: '-.02em' }}>
          {hookParts(c.hook, c.emphasis).map((p, i) => (
            <span key={i} style={p.em ? { fontStyle: 'italic', color: C.goldCta } : undefined}>{p.t}</span>
          ))}
        </Ed>
        <div style={{ height: 3, width: 80, background: `linear-gradient(90deg,${C.gold},${C.goldCta})`, borderRadius: 2, marginBottom: 24 }} />
        <Ed e={e} f="subhook" multi tag="p" s={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 28, lineHeight: 1.45, color: 'rgba(255,255,255,.78)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.subhook}</Ed>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '0 72px 52px', flexShrink: 0 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: C.goldCta, color: C.navy, padding: '18px 36px', borderRadius: 999, fontFamily: "'Inter',sans-serif", fontSize: 26, fontWeight: 800 }}>
          <Icon n="phone" size={24} />Call or text (801) 784-0095
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 5 · Right Column Split
// Left: hook + empathy + benefits | Right: photo (top) + star testimonial (bottom) | Gold CTA + address footer
// ─────────────────────────────────────────────────────────────────────────────
function Tpl5({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const fontSize = hs(c.hook?.length || 0, 80, 46);
  const benefits = [...(c.benefits || [])].slice(0, 4);
  while (benefits.length < 4) benefits.push([BENEFIT_ICONS[benefits.length], '']);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Main row */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 24, padding: '40px 36px 0 44px', overflow: 'hidden' }}>

        {/* Left */}
        <div style={{ width: '53%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <Ed e={e} f="eyebrow" s={{ fontSize: 17, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldMuted }}>{c.eyebrow}</Ed>
          <div style={{ height: 2, width: 44, background: `linear-gradient(90deg,${C.gold},${C.goldCta})`, borderRadius: 2 }} />

          <Ed e={e} f="hook" tag="h1" s={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: fontSize, lineHeight: .9, color: C.navy, textTransform: 'uppercase', margin: 0, letterSpacing: '-.02em' }}>{c.hook}</Ed>

          <Ed e={e} f="tagline" s={{ fontSize: 19, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.navy }}>{c.tagline}</Ed>

          <Ed e={e} f="problemDesc" multi tag="p" s={{ fontSize: 18, lineHeight: 1.45, color: '#4a556a', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.problemDesc || c.subhook}</Ed>

          {/* Benefits */}
          <div style={{ border: `1px solid rgba(201,168,76,.3)`, borderRadius: 14, padding: '13px 10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {benefits.map(([icon, label], i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', border: `1.5px solid ${C.gold}`, display: 'grid', placeItems: 'center', color: C.gold }}>
                    <Icon n={icon || BENEFIT_ICONS[i % 4]} size={20} sw={1.5} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.navyMid, textAlign: 'center', lineHeight: 1.15 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial pull quote */}
          <div style={{ flex: 1, minHeight: 0, background: C.navy, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
            <div style={{ fontSize: 48, lineHeight: .7, color: C.gold, fontFamily: "'Playfair Display',serif", fontWeight: 800, opacity: .7 }}>"</div>
            <Ed e={e} f="quote" multi tag="p" s={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 17, lineHeight: 1.45, color: 'rgba(255,255,255,.9)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' }}>{c.quote}</Ed>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 2, background: C.gold, borderRadius: 2 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: C.goldCta }}>– {c.proofName}</div>
            </div>
            <Stars size={16} />
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          {/* Photo */}
          <div style={{ flex: 1, position: 'relative', borderRadius: 18, overflow: 'hidden', background: '#1a2a40', minHeight: 0 }}>
            <Img srcs={img} pos={pos} />
          </div>
          {/* Testimonial card */}
          <div style={{ flexShrink: 0, background: '#fff', border: `1px solid rgba(201,168,76,.22)`, borderRadius: 14, padding: '13px 15px' }}>
            <Stars size={20} />
            <Ed e={e} f="quote" multi tag="p" s={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 15, lineHeight: 1.35, color: C.navyMid, margin: '7px 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.quote}</Ed>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>– {c.proofName}</div>
          </div>
        </div>
      </div>

      {/* Gold CTA bar */}
      <div style={{ background: C.gold, padding: '13px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.navy, display: 'grid', placeItems: 'center', color: C.goldCta }}><Icon n="phone" size={18} /></div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.navy }}>(801) 784-0095</div>
        </div>
        <Ed e={e} f="tagline" s={{ fontSize: 14, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.navy }}>{c.tagline || 'Call or Text to Get Started'}</Ed>
      </div>

      {/* Footer */}
      <div style={{ background: C.navy, padding: '10px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid rgba(201,168,76,.3)`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo h={32} bright />
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#fff' }}>FOOTHILL WELLNESS</div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.18em', color: C.goldCta, textTransform: 'uppercase' }}>FEEL BETTER FASTER</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {[['pin','1414 S Foothill Dr #D, SLC UT'],['phone','(801) 784-0095'],['globe','foothillwellness.com']].map(([icon,text]) => (
            <div key={icon} style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'rgba(255,255,255,.5)', fontSize: 11 }}><Icon n={icon} size={11} /><span>{text}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const TEMPLATES: { id: TemplateId; name: string; icon: string }[] = [
  { id: 'educate',   name: 'Full Bleed',  icon: 'image'  },
  { id: 'statement', name: 'Editorial',   icon: 'layers' },
  { id: 'proof',     name: 'Quote Card',  icon: 'heart'  },
  { id: 'photo',     name: 'Bold Navy',   icon: 'bolt'   },
  { id: 'editorial', name: 'Right Col',   icon: 'grid'   },
];

interface GraphicCanvasProps {
  tpl: TemplateId;
  content: GraphicContent;
  img?: string | string[] | null;
  imgPos?: { x: number; y: number };
  edit?: EH;
}

export default function GraphicCanvas({ tpl, content, img, imgPos, edit }: GraphicCanvasProps) {
  const srcs = img ? (Array.isArray(img) ? img : [img]) : null;
  const props = { c: content, img: srcs, pos: imgPos, e: edit };
  if (tpl === 'statement') return <Tpl2 {...props} />;
  if (tpl === 'proof')     return <Tpl3 {...props} />;
  if (tpl === 'photo')     return <Tpl4 {...props} />;
  if (tpl === 'editorial') return <Tpl5 {...props} />;
  return <Tpl1 {...props} />;
}
