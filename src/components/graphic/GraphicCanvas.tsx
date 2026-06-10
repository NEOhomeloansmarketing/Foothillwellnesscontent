'use client';
import { useState, useEffect } from 'react';
import type { GraphicContent, TemplateId } from '@/types';
import Icon from '@/components/ui/Icon';

const C = {
  navy: '#011836', navyMid: '#0F1F3D', navyDark: '#182943',
  gold: '#C9A84C', goldCta: '#D1BB74', goldMuted: '#B8A96A',
  cream: '#FAF8F3', beige: '#F3EDD8',
};

// ─── shared primitive components ─────────────────────────────────────────────

function NoPhoto({ dashed }: { dashed?: boolean }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: dashed ? '#EAE4D8' : C.navyDark, display: 'grid', placeItems: 'center', borderRadius: 'inherit' }}>
      {dashed
        ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: .5 }}>
            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.navyMid} strokeWidth={1.4}><rect x={3} y={3} width={18} height={18} rx={2} /><circle cx={8.5} cy={8.5} r={1.5} /><path d="M21 15l-5-5-4 4-2-2-7 7" /></svg>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.navyMid }}>IMAGE</span>
          </div>
        : <div style={{ fontSize: 22, letterSpacing: '.14em', color: 'rgba(209,187,116,.4)', border: '2px dashed rgba(209,187,116,.3)', padding: '14px 28px', borderRadius: 10, fontFamily: "'Inter',sans-serif" }}>ADD PHOTO</div>
      }
    </div>
  );
}

function Img({ srcs, pos, style }: { srcs: string[] | null; pos?: { x: number; y: number }; style?: React.CSSProperties }) {
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [srcs?.[0]]);
  if (!srcs || i >= srcs.length) return <NoPhoto />;
  return <img src={srcs[i]} onError={() => setI(v => v + 1)} crossOrigin="anonymous"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos ? `${pos.x}% ${pos.y}%` : '50% 35%', ...style }} alt="" />;
}

function ImgDashed({ srcs, pos }: { srcs: string[] | null; pos?: { x: number; y: number } }) {
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [srcs?.[0]]);
  if (!srcs || i >= srcs.length) return <NoPhoto dashed />;
  return <img src={srcs[i]} onError={() => setI(v => v + 1)} crossOrigin="anonymous"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos ? `${pos.x}% ${pos.y}%` : '50% 35%', borderRadius: 'inherit' }} alt="" />;
}

function Logo({ h = 44, bright }: { h?: number; bright?: boolean }) {
  return <img src="/foothill-logo.png" alt="" style={{ height: h, borderRadius: h * 0.1, display: 'block', filter: bright ? 'brightness(0) invert(1)' : undefined, opacity: bright ? .85 : 1 }} />;
}

function Stars({ n = 24 }: { n?: number }) {
  return <div style={{ display: 'flex', gap: 3 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: C.gold, fontSize: n }}>★</span>)}</div>;
}

interface EH { on: boolean; set: (f: string, v: string) => void; }

function T({ e, f, tag = 'div', multi, s, children }: {
  e?: EH; f: string; tag?: 'div'|'h1'|'h2'|'p'|'blockquote'|'span';
  multi?: boolean; s?: React.CSSProperties; children?: React.ReactNode;
}) {
  const p = {
    className: e?.on ? 'ged' : undefined,
    contentEditable: e?.on || undefined,
    suppressContentEditableWarning: true, spellCheck: false,
    onBlur: e?.on ? (ev: React.FocusEvent<HTMLElement>) => { const t = ev.currentTarget.innerText.trim(); if (t) e.set(f, t); } : undefined,
    onKeyDown: e?.on && !multi ? (ev: React.KeyboardEvent) => { if (ev.key === 'Enter') { ev.preventDefault(); (ev.currentTarget as HTMLElement).blur(); } } : undefined,
    style: s,
  };
  if (tag === 'h1') return <h1 {...p}>{children}</h1>;
  if (tag === 'h2') return <h2 {...p}>{children}</h2>;
  if (tag === 'p') return <p {...p}>{children}</p>;
  if (tag === 'blockquote') return <blockquote {...p}>{children}</blockquote>;
  if (tag === 'span') return <span {...p}>{children}</span>;
  return <div {...p}>{children}</div>;
}

function hookParts(hook: string, em?: string) {
  if (!em) return [{ t: hook, em: false }];
  const i = hook.toLowerCase().indexOf(em.toLowerCase());
  if (i < 0) return [{ t: hook, em: false }];
  return [{ t: hook.slice(0, i), em: false }, { t: hook.slice(i, i + em.length), em: true }, { t: hook.slice(i + em.length), em: false }];
}

function hookSize(len: number, max: number, min: number) {
  if (len <= 12) return max;
  if (len >= 50) return min;
  return Math.round(max - (max - min) * (len - 12) / 38);
}

const ICONS = ['moon', 'bolt', 'drop', 'heart'] as const;

function Benefits4({ benefits }: { benefits: [string, string][] }) {
  const items = benefits.slice(0, 4);
  while (items.length < 4) items.push([ICONS[items.length % 4], 'Benefit']);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {items.map(([icon, label], i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', border: `1.5px solid ${C.gold}`, display: 'grid', placeItems: 'center', color: C.gold, flexShrink: 0 }}>
            <Icon n={icon || ICONS[i % 4]} size={24} sw={1.5} />
          </div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: C.navyMid, textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── TEMPLATE 1 · Split Info ─────────────────────────────────────────────────
// Left text col | Right rounded image | Bottom: testimonial + CTA | Footer
function Tpl1({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const hs = hookSize(c.hook?.length || 0, 86, 52);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif", overflow: 'hidden' }}>

      {/* ── Main row ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 24, padding: '44px 40px 16px 44px', overflow: 'hidden' }}>

        {/* Left text */}
        <div style={{ width: '55%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <T e={e} f="eyebrow" s={{ fontSize: 18, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldMuted, whiteSpace: 'nowrap', overflow: 'hidden' }}>{c.eyebrow}</T>
          <div style={{ height: 2, width: 48, background: `linear-gradient(90deg,${C.gold},${C.goldCta})`, borderRadius: 2, flexShrink: 0 }} />

          <T e={e} f="hook" tag="h1" s={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: hs, lineHeight: .9, color: C.navy, textTransform: 'uppercase', letterSpacing: '-.02em', margin: 0, overflow: 'hidden' }}>{c.hook}</T>

          <T e={e} f="tagline" s={{ fontSize: 20, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.gold, overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.tagline || c.subhook}</T>

          <T e={e} f="problemDesc" multi tag="p" s={{ fontSize: 19, lineHeight: 1.45, color: '#4a556a', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.problemDesc || c.subhook}</T>

          {/* HOW WE CAN HELP */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'inline-flex', background: C.navy, color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 7, marginBottom: 12 }}>HOW WE CAN HELP</div>
            <div style={{ border: `1.5px solid rgba(201,168,76,.35)`, borderRadius: 14, padding: '16px 12px' }}>
              <Benefits4 benefits={c.benefits || []} />
            </div>
          </div>
        </div>

        {/* Right image */}
        <div style={{ flex: 1, position: 'relative', borderRadius: 22, overflow: 'hidden', background: C.navyDark, minHeight: 0 }}>
          <Img srcs={img} pos={pos} />
        </div>
      </div>

      {/* ── Bottom: testimonial + CTA ── */}
      <div style={{ display: 'flex', gap: 14, padding: '0 40px 16px 44px', flexShrink: 0 }}>
        {/* Testimonial */}
        <div style={{ flex: 1, minWidth: 0, background: '#fff', border: `1.5px solid rgba(201,168,76,.25)`, borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 12, overflow: 'hidden' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 64, color: C.gold, lineHeight: .65, flexShrink: 0, marginTop: 4 }}>&ldquo;</div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <T e={e} f="quote" multi tag="p" s={{ fontSize: 16, lineHeight: 1.4, color: C.navyMid, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.quote}</T>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginTop: 8 }}>– {c.proofName}</div>
          </div>
        </div>

        {/* CTA box */}
        <div style={{ width: 300, flexShrink: 0, background: C.navy, borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldCta, marginBottom: 10 }}>READY FOR YOUR OUTCOME?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.gold, display: 'grid', placeItems: 'center', color: C.navy, flexShrink: 0 }}><Icon n="phone" size={20} /></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>CALL/TEXT</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>(801) 784-0095</div>
            </div>
          </div>
          <div style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,.45)' }}>We make it easy. You take the first step.</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: C.navy, padding: '14px 44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, borderTop: `3px solid ${C.gold}`, flexShrink: 0 }}>
        <Logo h={38} bright />
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '.08em' }}>FOOTHILL WELLNESS</div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.2em', color: C.goldCta, textTransform: 'uppercase' }}>FEEL BETTER FASTER</div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 2 · Split Circular ────────────────────────────────────────────
// Left text col | Circular image right with badge | Dark quote bar | Solution + CTA | Address footer
function Tpl2({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const hs = hookSize(c.hook?.length || 0, 80, 48);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif", overflow: 'hidden' }}>

      {/* ── Main row ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>

        {/* Left text */}
        <div style={{ width: '52%', flexShrink: 0, padding: '44px 32px 20px 44px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <T e={e} f="eyebrow" s={{ fontSize: 17, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldMuted, whiteSpace: 'nowrap', overflow: 'hidden' }}>{c.eyebrow}</T>

          <T e={e} f="hook" tag="h1" s={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: hs, lineHeight: .9, color: C.navy, textTransform: 'uppercase', letterSpacing: '-.02em', margin: 0, overflow: 'hidden' }}>{c.hook}</T>

          {/* Mountain divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
            <svg width={32} height={20} viewBox="0 0 36 22" fill="none"><path d="M2 20 L10 6 L18 14 L26 4 L34 20" stroke={C.gold} strokeWidth={2} strokeLinejoin="round" /></svg>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold})` }} />
          </div>

          <T e={e} f="tagline" s={{ fontSize: 18, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.gold, overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.tagline}</T>

          <T e={e} f="problemDesc" multi tag="p" s={{ fontSize: 18, lineHeight: 1.4, color: '#4a556a', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.problemDesc || c.subhook}</T>

          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'inline-flex', background: C.navy, color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', padding: '7px 16px', borderRadius: 7, marginBottom: 10 }}>HOW WE CAN HELP</div>
            <div style={{ border: `1.5px solid rgba(201,168,76,.35)`, borderRadius: 14, padding: '14px 10px' }}>
              <Benefits4 benefits={c.benefits || []} />
            </div>
          </div>
        </div>

        {/* Right: circular image */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '32px 36px 20px 0' }}>
          <div style={{ width: 380, height: 380, borderRadius: '50%', overflow: 'hidden', position: 'relative', background: C.navyDark, border: `3px solid rgba(201,168,76,.3)`, boxShadow: '0 16px 48px rgba(1,24,54,.3)' }}>
            <Img srcs={img} pos={pos} />
          </div>
          {/* Badge */}
          <div style={{ position: 'absolute', bottom: 28, right: 40, width: 90, height: 90, borderRadius: '50%', background: C.navy, border: `2.5px solid ${C.gold}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,0,0,.4)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>FEEL<br />BETTER</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: C.goldCta, marginTop: 2 }}>FASTER</div>
          </div>
        </div>
      </div>

      {/* ── Dark quote bar ── */}
      <div style={{ background: C.navy, padding: '16px 44px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, color: C.gold, lineHeight: .7, flexShrink: 0 }}>&ldquo;</div>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <T e={e} f="quote" multi tag="p" s={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 17, lineHeight: 1.4, color: 'rgba(255,255,255,.9)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.quote}</T>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.goldCta, marginTop: 6 }}>– {c.proofName}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <Stars n={19} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.goldCta, letterSpacing: '.08em' }}>5 STAR EXPERIENCE</div>
        </div>
      </div>

      {/* ── Solution + CTA row ── */}
      <div style={{ display: 'flex', padding: '12px 44px', gap: 20, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center', overflow: 'hidden' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${C.gold}`, display: 'grid', placeItems: 'center', color: C.gold, flexShrink: 0 }}><Icon n="check" size={20} /></div>
          <div style={{ minWidth: 0 }}>
            <T e={e} f="tagline" s={{ fontSize: 15, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.navyMid, whiteSpace: 'nowrap', overflow: 'hidden' }}>{c.tagline}</T>
            <T e={e} f="speed" tag="p" s={{ fontSize: 14, lineHeight: 1.35, color: '#5a6273', margin: '2px 0 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.speed || c.subhook}</T>
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.goldMuted, marginBottom: 4 }}>READY FOR YOUR OUTCOME?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.navy, display: 'grid', placeItems: 'center', color: C.goldCta }}><Icon n="phone" size={17} /></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,.35)', textTransform: 'uppercase' }}>CALL/TEXT</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, lineHeight: 1 }}>(801) 784-0095</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer with address ── */}
      <div style={{ background: C.navy, padding: '11px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `3px solid ${C.gold}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo h={36} bright />
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#fff' }}>FOOTHILL WELLNESS</div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'rgba(255,255,255,.55)', fontSize: 12 }}><Icon n="pin" size={13} /><span>1414 S Foothill Dr #D, SLC UT 84108</span></div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'rgba(255,255,255,.55)', fontSize: 12 }}><Icon n="globe" size={13} /><span>foothillwellness.com</span></div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 3 · Right Column ───────────────────────────────────────────────
// Left: text + benefits | Right: image card top + testimonial card bottom | Gold CTA bar | Footer
function Tpl3({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const hs = hookSize(c.hook?.length || 0, 84, 50);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif", overflow: 'hidden' }}>

      {/* ── Main row ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 24, padding: '44px 40px 16px 44px', overflow: 'hidden' }}>

        {/* Left */}
        <div style={{ width: '54%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <T e={e} f="eyebrow" s={{ fontSize: 18, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldMuted, whiteSpace: 'nowrap', overflow: 'hidden' }}>{c.eyebrow}</T>
          <div style={{ height: 2, width: 48, background: `linear-gradient(90deg,${C.gold},${C.goldCta})`, borderRadius: 2, flexShrink: 0 }} />

          <T e={e} f="hook" tag="h1" s={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: hs, lineHeight: .9, color: C.navy, textTransform: 'uppercase', letterSpacing: '-.02em', margin: 0, overflow: 'hidden' }}>{c.hook}</T>

          <T e={e} f="tagline" s={{ fontSize: 22, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.navyMid, overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.tagline}</T>

          <T e={e} f="problemDesc" multi tag="p" s={{ fontSize: 19, lineHeight: 1.4, color: '#4a556a', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.problemDesc || c.subhook}</T>

          <div style={{ border: `1.5px solid rgba(201,168,76,.35)`, borderRadius: 14, padding: '14px 12px', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.navyMid, textAlign: 'center', marginBottom: 12 }}>BENEFITS &amp; PROOF</div>
            <Benefits4 benefits={c.benefits || []} />
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          {/* Image (dashed) */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', borderRadius: 20, overflow: 'hidden', border: '2px dashed #C8BAA0', background: '#EAE4D8' }}>
            <ImgDashed srcs={img} pos={pos} />
          </div>

          {/* Testimonial card */}
          <div style={{ flexShrink: 0, background: '#fff', border: `1.5px solid rgba(201,168,76,.25)`, borderRadius: 16, padding: '14px 16px', overflow: 'hidden' }}>
            <Stars n={21} />
            <T e={e} f="quote" multi tag="p" s={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 16, lineHeight: 1.35, color: C.navyMid, margin: '8px 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.quote}</T>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>– {c.proofName}</div>
          </div>
        </div>
      </div>

      {/* ── Gold CTA bar ── */}
      <div style={{ background: C.gold, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.navy, display: 'grid', placeItems: 'center', color: C.goldCta, flexShrink: 0 }}><Icon n="phone" size={20} /></div>
        <div>
          <T e={e} f="tagline" s={{ fontSize: 14, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: C.navy }}>{c.tagline || 'CALL/TEXT TO GET STARTED'}</T>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.navy, lineHeight: 1.1 }}>(801) 784-0095</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: C.navy, padding: '11px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid rgba(201,168,76,.35)`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo h={36} bright />
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#fff' }}>FOOTHILL WELLNESS</div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', color: C.goldCta, textTransform: 'uppercase' }}>FEEL BETTER FASTER</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[['pin','1414 S Foothill Dr #D, SLC UT 84108'],['phone','(801) 784-0095'],['globe','foothillwellness.com']].map(([icon,text]) => (
            <div key={icon} style={{ display: 'flex', gap: 5, alignItems: 'center', color: 'rgba(255,255,255,.55)', fontSize: 12 }}><Icon n={icon} size={12} /><span>{text}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 4 · Full Bleed ─────────────────────────────────────────────────
// Full image + gradient overlay, logo box top-left, location tag, headline, pill CTA
function Tpl4({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const hs = hookSize(c.hook?.length || 0, 100, 62);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy }}>
      <Img srcs={img} pos={pos} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(1,24,54,.7) 0%,rgba(1,24,54,.05) 32%,rgba(1,24,54,.05) 48%,rgba(1,24,54,.65) 70%,rgba(1,24,54,.97) 100%)' }} />

      {/* Top */}
      <div style={{ position: 'absolute', top: 44, left: 44, right: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ background: C.navy, borderRadius: 14, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 10, border: `1px solid rgba(201,168,76,.2)` }}>
          <Logo h={32} bright />
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.05em' }}>FOOTHILL</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.05em', marginTop: -2 }}>WELLNESS</div>
          </div>
        </div>
        <T e={e} f="eyebrow" s={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldCta }}>{c.eyebrow}</T>
      </div>

      {/* Bottom */}
      <div style={{ position: 'absolute', left: 56, right: 56, bottom: 56 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: hs, lineHeight: .92, color: '#fff', margin: '0 0 20px', letterSpacing: '-.02em' }}>
          {hookParts(c.hook, c.emphasis).map((p, i) => (
            <span key={i} style={p.em ? { fontStyle: 'italic', color: C.goldCta } : undefined}>{p.t}</span>
          ))}
        </h2>
        <div style={{ height: 3, width: 60, background: C.goldCta, borderRadius: 2, marginBottom: 20 }} />
        <T e={e} f="subhook" multi tag="p" s={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: 24, lineHeight: 1.45, color: 'rgba(255,255,255,.82)', margin: '0 0 28px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.subhook}</T>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: C.goldCta, color: C.navy, padding: '16px 32px', borderRadius: 999, fontSize: 24, fontWeight: 800, fontFamily: "'Inter',sans-serif" }}>
          <Icon n="phone" size={22} />Call or text (801) 784-0095
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 5 · Quote Card ─────────────────────────────────────────────────
// Image strip top | Large quote + attribution | Phone footer
function Tpl5({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EH }) {
  const qLen = c.quote?.length || 0;
  const qs = qLen > 180 ? 34 : qLen > 120 ? 40 : qLen > 70 ? 48 : 56;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif", overflow: 'hidden' }}>

      {/* ── Top image strip ── */}
      <div style={{ height: '38%', position: 'relative', background: C.navyDark, flexShrink: 0 }}>
        <Img srcs={img} pos={pos} />
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(1,24,54,.45) 0%,rgba(1,24,54,.2) 60%,rgba(1,24,54,.55) 100%)' }} />
        <div style={{ position: 'absolute', top: 28, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ background: C.navy, borderRadius: 12, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 10, border: `1px solid rgba(201,168,76,.25)` }}>
            <Logo h={28} bright />
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: '#fff' }}>FOOTHILL WELLNESS</div>
          </div>
          <T e={e} f="eyebrow" s={{ fontSize: 14, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldCta }}>{c.eyebrow || 'Real Client Story'}</T>
        </div>
      </div>

      {/* ── Quote section ── */}
      <div style={{ flex: 1, minHeight: 0, padding: '32px 48px 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 120, color: C.goldCta, lineHeight: .6, flexShrink: 0, opacity: .65 }}>&ldquo;</div>

        <T e={e} f="quote" multi tag="blockquote" s={{
          fontFamily: "'Playfair Display',serif", fontStyle: 'italic',
          fontSize: qs, lineHeight: 1.28, color: C.navyMid, margin: '8px 0 0',
          paddingLeft: 28, borderLeft: `4px solid ${C.gold}`, letterSpacing: '-.01em',
          flex: 1, minHeight: 0, overflow: 'hidden',
        }}>{c.quote}</T>

        {/* Attribution */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 20, flexShrink: 0 }}>
          <div>
            <T e={e} f="proofName" s={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{c.proofName}</T>
            <T e={e} f="proofMeta" s={{ fontSize: 16, color: C.goldMuted, marginTop: 3 }}>{c.proofMeta}</T>
          </div>
          <Stars n={27} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', borderTop: `1.5px solid rgba(201,168,76,.25)`, marginTop: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.navy, display: 'grid', placeItems: 'center', color: C.goldCta }}><Icon n="phone" size={17} /></div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.goldMuted }}>CALL OR TEXT</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, lineHeight: 1 }}>(801) 784-0095</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 16, color: C.gold, lineHeight: 1.3 }}>Your body already knows how to heal.</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: C.navyMid, marginTop: 2 }}>WE HELP IT HEAL FASTER.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const TEMPLATES: { id: TemplateId; name: string; icon: string }[] = [
  { id: 'educate',   name: 'Split Info',   icon: 'layers' },
  { id: 'statement', name: 'Circular',     icon: 'target' },
  { id: 'proof',     name: 'Right Col',    icon: 'grid'   },
  { id: 'photo',     name: 'Full Bleed',   icon: 'image'  },
  { id: 'editorial', name: 'Quote Card',   icon: 'heart'  },
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
