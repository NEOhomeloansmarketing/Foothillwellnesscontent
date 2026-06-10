'use client';
import { useState, useEffect } from 'react';
import type { GraphicContent, TemplateId } from '@/types';
import Icon from '@/components/ui/Icon';

const C = {
  navy: '#011836', navyMid: '#0F1F3D', navyDark: '#182943',
  gold: '#C9A84C', goldCta: '#D1BB74', goldMuted: '#B8A96A',
  cream: '#FAF8F3', beige: '#F3EDD8', white: '#FFFFFF',
};

function StripePlaceholder({ dashed }: { dashed?: boolean }) {
  if (dashed) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: '#EDE8DC',
        display: 'grid', placeItems: 'center',
        border: '2px dashed #C8BAA0',
        borderRadius: 'inherit',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: .55 }}>
          <svg width={52} height={52} viewBox="0 0 24 24" fill="none" stroke={C.navyMid} strokeWidth={1.4}>
            <rect x={3} y={3} width={18} height={18} rx={2} />
            <circle cx={8.5} cy={8.5} r={1.5} />
            <path d="M21 15l-5-5-4 4-2-2-7 7" />
          </svg>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.navyMid }}>IMAGE PLACEHOLDER</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `repeating-linear-gradient(135deg,${C.navyDark} 0 32px,${C.navyMid} 32px 64px)`,
      display: 'grid', placeItems: 'center',
    }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, letterSpacing: '.18em', color: 'rgba(209,187,116,.55)', border: '2px dashed rgba(209,187,116,.35)', padding: '20px 36px', borderRadius: 12 }}>ADD PHOTO</div>
    </div>
  );
}

function SmartImage({ srcs, pos, style }: { srcs: string[] | null; pos?: { x: number; y: number }; style?: React.CSSProperties }) {
  const [i, setI] = useState(0);
  const firstSrc = srcs?.[0];
  useEffect(() => { setI(0); }, [firstSrc]);
  if (!srcs || i >= srcs.length) return <StripePlaceholder />;
  const objectPosition = pos ? `${pos.x}% ${pos.y}%` : '50% 35%';
  return (
    <img src={srcs[i]} onError={() => setI(v => v + 1)} crossOrigin="anonymous"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition, ...style }} alt="" />
  );
}

function SmartImageDashed({ srcs, pos }: { srcs: string[] | null; pos?: { x: number; y: number } }) {
  const [i, setI] = useState(0);
  const firstSrc = srcs?.[0];
  useEffect(() => { setI(0); }, [firstSrc]);
  if (!srcs || i >= srcs.length) return <StripePlaceholder dashed />;
  const objectPosition = pos ? `${pos.x}% ${pos.y}%` : '50% 35%';
  return (
    <img src={srcs[i]} onError={() => setI(v => v + 1)} crossOrigin="anonymous"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition, borderRadius: 'inherit' }} alt="" />
  );
}

function FoothillLogo({ size = 48, bright }: { size?: number; bright?: boolean }) {
  return <img src="/foothill-logo.png" alt="Foothill Wellness" style={{ height: size, borderRadius: size * 0.1, display: 'block', filter: bright ? 'brightness(0) invert(1)' : undefined, opacity: bright ? .88 : 1 }} />;
}

function Stars({ size = 28, color = C.gold }: { size?: number; color?: string }) {
  return <div style={{ display: 'flex', gap: 4 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color, fontSize: size }}>★</span>)}</div>;
}

interface EditHandle { on: boolean; set: (field: string, val: string) => void; }

function ET({ e, field, tag = 'div', multi, style, children }: {
  e?: EditHandle; field: string; tag?: 'div'|'h1'|'h2'|'h3'|'p'|'blockquote'|'span';
  multi?: boolean; style?: React.CSSProperties; children?: React.ReactNode;
}) {
  const shared = {
    className: e?.on ? 'ged' : undefined,
    contentEditable: e?.on || undefined,
    suppressContentEditableWarning: true, spellCheck: false,
    onBlur: e?.on ? (ev: React.FocusEvent<HTMLElement>) => {
      const t = ev.currentTarget.innerText.replace(/\s+\n/g, '\n').trim();
      if (t && e.set) e.set(field, t);
    } : undefined,
    onKeyDown: e?.on && !multi ? (ev: React.KeyboardEvent) => {
      if (ev.key === 'Enter') { ev.preventDefault(); (ev.currentTarget as HTMLElement).blur(); }
    } : undefined,
    style,
  };
  if (tag === 'h1') return <h1 {...shared}>{children}</h1>;
  if (tag === 'h2') return <h2 {...shared}>{children}</h2>;
  if (tag === 'h3') return <h3 {...shared}>{children}</h3>;
  if (tag === 'p') return <p {...shared}>{children}</p>;
  if (tag === 'blockquote') return <blockquote {...shared}>{children}</blockquote>;
  if (tag === 'span') return <span {...shared}>{children}</span>;
  return <div {...shared}>{children}</div>;
}

function hookParts(hook: string, emphasis?: string) {
  if (!emphasis) return [{ t: hook, em: false }];
  const i = hook.toLowerCase().indexOf(emphasis.toLowerCase());
  if (i < 0) return [{ t: hook, em: false }];
  return [{ t: hook.slice(0, i), em: false }, { t: hook.slice(i, i + emphasis.length), em: true }, { t: hook.slice(i + emphasis.length), em: false }];
}

const BENEFIT_ICONS = ['moon', 'bolt', 'drop', 'heart'] as const;

function BenefitGrid({ benefits, cols = 4 }: { benefits: [string, string][]; cols?: number }) {
  const items = benefits.slice(0, cols);
  while (items.length < cols) items.push([BENEFIT_ICONS[items.length % 4], '']);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
      {items.map(([icon, label], i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: `1.5px solid ${C.gold}`, display: 'grid', placeItems: 'center', color: C.gold }}>
            <Icon n={icon || BENEFIT_ICONS[i % 4]} size={28} sw={1.5} />
          </div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.navyMid, textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── TEMPLATE 1: SPLIT INFO ────────────────────────────────────────────────────
// Left text, right rounded-rect image, bottom testimonial + CTA, logo footer
function Tpl1({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const hookLen = c.hook?.length || 0;
  const hSize = hookLen > 22 ? 90 : hookLen > 14 ? 108 : 128;
  const benefits4 = (c.benefits || []).slice(0, 4);
  while (benefits4.length < 4) benefits4.push([BENEFIT_ICONS[benefits4.length], 'Benefit']);

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif" }}>

      {/* Main row */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, padding: '52px 52px 0 52px', gap: 36 }}>

        {/* LEFT: text */}
        <div style={{ flex: '0 0 520px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <ET e={e} field="eyebrow" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldMuted }}>
            {c.eyebrow}
          </ET>
          <div style={{ height: 2, width: 56, background: `linear-gradient(90deg,${C.gold},${C.goldCta})`, borderRadius: 2 }} />

          <ET e={e} field="hook" tag="h1" style={{
            fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: hSize,
            lineHeight: .88, color: C.navy, textTransform: 'uppercase', letterSpacing: '-.02em', margin: 0,
          }}>{c.hook}</ET>

          <ET e={e} field="tagline" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: C.gold }}>
            {c.tagline || c.subhook}
          </ET>

          <ET e={e} field="problemDesc" multi tag="p" style={{ fontSize: 22, lineHeight: 1.45, color: '#4a556a', margin: 0 }}>
            {c.problemDesc || c.subhook}
          </ET>

          {/* HOW WE CAN HELP */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: C.navy, color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', padding: '10px 24px', borderRadius: 8, marginBottom: 18 }}>
              HOW WE CAN HELP
            </div>
            <div style={{ border: `1.5px solid rgba(201,168,76,.4)`, borderRadius: 18, padding: '22px 16px' }}>
              <BenefitGrid benefits={benefits4} />
            </div>
          </div>
        </div>

        {/* RIGHT: image card */}
        <div style={{ flex: 1, position: 'relative', borderRadius: 28, overflow: 'hidden', background: C.navyDark, minHeight: 0 }}>
          <SmartImage srcs={img} pos={pos} />
        </div>
      </div>

      {/* Bottom row: testimonial + CTA */}
      <div style={{ display: 'flex', gap: 16, padding: '20px 52px 20px' }}>
        {/* Testimonial */}
        <div style={{ flex: 1, background: '#fff', border: `1.5px solid rgba(201,168,76,.3)`, borderRadius: 18, padding: '20px 24px', display: 'flex', gap: 16 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 80, color: C.gold, lineHeight: .7, flex: 'none', marginTop: 4 }}>&ldquo;</div>
          <div>
            <ET e={e} field="quote" multi tag="p" style={{ fontSize: 18, lineHeight: 1.45, color: C.navyMid, margin: 0 }}>{c.quote}</ET>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginTop: 10, letterSpacing: '.04em' }}>– {c.proofName}</div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ width: 340, background: C.navy, borderRadius: 18, padding: '20px 24px', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldCta, marginBottom: 12 }}>READY FOR YOUR OUTCOME?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.gold, display: 'grid', placeItems: 'center', color: C.navy, flexShrink: 0 }}>
              <Icon n="phone" size={22} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.1em' }}>CALL/TEXT</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1 }}>(801) 784-0095</div>
            </div>
          </div>
          <div style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,.5)' }}>We make it easy. You take the first step.</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: C.navy, padding: '18px 52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, borderTop: `3px solid ${C.gold}` }}>
        <FoothillLogo size={44} bright />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '.1em' }}>FOOTHILL WELLNESS</div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.22em', color: C.goldCta, textTransform: 'uppercase', marginTop: 2 }}>FEEL BETTER FASTER</div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 2: SPLIT CIRCULAR ───────────────────────────────────────────────
// Left text, circular image right with badge, dark testimonial bar, solution + CTA, address footer
function Tpl2({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const hookLen = c.hook?.length || 0;
  const hSize = hookLen > 22 ? 88 : hookLen > 14 ? 106 : 122;
  const benefits4 = (c.benefits || []).slice(0, 4);
  while (benefits4.length < 4) benefits4.push([BENEFIT_ICONS[benefits4.length], 'Benefit']);

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif" }}>

      {/* Main row */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT: text */}
        <div style={{ flex: '0 0 550px', padding: '52px 40px 28px 52px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <ET e={e} field="eyebrow" style={{ fontSize: 21, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldMuted }}>
            {c.eyebrow}
          </ET>

          <ET e={e} field="hook" tag="h1" style={{
            fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: hSize,
            lineHeight: .88, color: C.navy, textTransform: 'uppercase', letterSpacing: '-.02em', margin: 0,
          }}>{c.hook}</ET>

          {/* Mountain divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
            <svg width={36} height={22} viewBox="0 0 36 22" fill="none">
              <path d="M2 20 L10 6 L18 14 L26 4 L34 20" stroke={C.gold} strokeWidth={2} strokeLinejoin="round" />
            </svg>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold})` }} />
          </div>

          <ET e={e} field="tagline" style={{ fontSize: 23, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: C.gold }}>
            {c.tagline || c.subhook}
          </ET>

          <ET e={e} field="problemDesc" multi tag="p" style={{ fontSize: 21, lineHeight: 1.45, color: '#4a556a', margin: 0 }}>
            {c.problemDesc || c.subhook}
          </ET>

          {/* HOW WE CAN HELP */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: C.navy, color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', padding: '8px 20px', borderRadius: 8, marginBottom: 16 }}>
              HOW WE CAN HELP
            </div>
            <div style={{ border: `1.5px solid rgba(201,168,76,.4)`, borderRadius: 18, padding: '20px 16px' }}>
              <BenefitGrid benefits={benefits4} />
            </div>
          </div>
        </div>

        {/* RIGHT: circular image */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 40px 0 0', position: 'relative' }}>
          <div style={{ width: 420, height: 420, borderRadius: '50%', overflow: 'hidden', position: 'relative', background: C.navyDark, border: `4px solid rgba(201,168,76,.35)`, boxShadow: '0 20px 60px rgba(1,24,54,.3)' }}>
            <SmartImage srcs={img} pos={pos} />
          </div>
          {/* FEEL BETTER FASTER badge */}
          <div style={{ position: 'absolute', bottom: 44, right: 44, width: 100, height: 100, borderRadius: '50%', background: C.navy, border: `3px solid ${C.gold}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,.35)' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>FEEL<br />BETTER</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: '.04em', color: C.goldCta, marginTop: 3 }}>FASTER</div>
          </div>
        </div>
      </div>

      {/* Dark testimonial bar */}
      <div style={{ background: C.navy, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 60, color: C.gold, lineHeight: .7, flexShrink: 0, marginBottom: 8 }}>&ldquo;</div>
        <div style={{ flex: 1 }}>
          <ET e={e} field="quote" multi tag="p" style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 20, lineHeight: 1.4, color: 'rgba(255,255,255,.9)', margin: 0 }}>
            {c.quote}
          </ET>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.goldCta, marginTop: 8, letterSpacing: '.06em' }}>– {c.proofName}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <Stars size={22} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.goldCta, letterSpacing: '.08em' }}>5 STAR EXPERIENCE</div>
        </div>
      </div>

      {/* Solution + CTA row */}
      <div style={{ display: 'flex', padding: '16px 52px', gap: 24, alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: `2px solid ${C.gold}`, display: 'grid', placeItems: 'center', color: C.gold, flexShrink: 0 }}>
            <Icon n="check" size={24} />
          </div>
          <div>
            <ET e={e} field="tagline" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.navyMid }}>{c.tagline}</ET>
            <ET e={e} field="speed" multi tag="p" style={{ fontSize: 16, lineHeight: 1.4, color: '#5a6273', margin: '4px 0 0' }}>{c.speed || c.subhook}</ET>
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldMuted, marginBottom: 4 }}>READY FOR YOUR OUTCOME?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.navy, display: 'grid', placeItems: 'center', color: C.goldCta }}>
              <Icon n="phone" size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(0,0,0,.4)', textTransform: 'uppercase' }}>CALL/TEXT</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, lineHeight: 1 }}>(801) 784-0095</div>
            </div>
          </div>
          <div style={{ fontSize: 13, fontStyle: 'italic', color: '#888', marginTop: 4 }}>We make it easy. You take the first step.</div>
        </div>
      </div>

      {/* Footer with address */}
      <div style={{ background: C.navy, padding: '14px 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `3px solid ${C.gold}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <FoothillLogo size={40} bright />
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '.08em' }}>FOOTHILL WELLNESS</div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'rgba(255,255,255,.65)', fontSize: 14 }}>
          <Icon n="pin" size={16} />
          <span>1414 S Foothill Drive #D, Salt Lake City, UT 84108</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'rgba(255,255,255,.65)', fontSize: 14 }}>
          <Icon n="globe" size={16} />
          <span>foothillwellness.com</span>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 3: RIGHT COLUMN ─────────────────────────────────────────────────
// Left text + gold CTA bar, right column: image top + star testimonial bottom, address footer
function Tpl3({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const hookLen = c.hook?.length || 0;
  const hSize = hookLen > 22 ? 86 : hookLen > 14 ? 104 : 122;
  const benefits4 = (c.benefits || []).slice(0, 4);
  while (benefits4.length < 4) benefits4.push([BENEFIT_ICONS[benefits4.length], 'Benefit']);

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif" }}>

      {/* Main row */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, padding: '52px 44px 0 52px', gap: 32 }}>

        {/* LEFT: text */}
        <div style={{ flex: '0 0 530px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ET e={e} field="eyebrow" style={{ fontSize: 21, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldMuted }}>
            {c.eyebrow}
          </ET>
          <div style={{ height: 2, width: 56, background: `linear-gradient(90deg,${C.gold},${C.goldCta})`, borderRadius: 2 }} />

          <ET e={e} field="hook" tag="h1" style={{
            fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: hSize,
            lineHeight: .88, color: C.navy, textTransform: 'uppercase', letterSpacing: '-.02em', margin: 0,
          }}>{c.hook}</ET>

          <ET e={e} field="tagline" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.navy }}>
            {c.tagline}
          </ET>

          <ET e={e} field="problemDesc" multi tag="p" style={{ fontSize: 22, lineHeight: 1.45, color: '#4a556a', margin: 0 }}>
            {c.problemDesc || c.subhook}
          </ET>

          {/* Benefits box */}
          <div style={{ border: `1.5px solid rgba(201,168,76,.4)`, borderRadius: 18, padding: '20px 16px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: C.navyMid, textAlign: 'center', marginBottom: 16 }}>
              BENEFITS OR PROOF
            </div>
            <BenefitGrid benefits={benefits4} />
          </div>
        </div>

        {/* RIGHT column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0 }}>
          {/* Image placeholder (dashed border) */}
          <div style={{ flex: 1, position: 'relative', borderRadius: 22, overflow: 'hidden', border: '2px dashed #C8BAA0', background: '#EDE8DC', minHeight: 0 }}>
            <SmartImageDashed srcs={img} pos={pos} />
          </div>

          {/* Star testimonial card */}
          <div style={{ flexShrink: 0, background: '#fff', border: `1.5px solid rgba(201,168,76,.3)`, borderRadius: 18, padding: '18px 20px' }}>
            <Stars size={24} />
            <ET e={e} field="quote" multi tag="p" style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, color: C.navyMid, margin: '10px 0 8px' }}>
              {c.quote}
            </ET>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginTop: 8 }}>– {c.proofName}</div>
          </div>
        </div>
      </div>

      {/* Gold CTA bar */}
      <div style={{ background: C.gold, padding: '18px 52px', display: 'flex', alignItems: 'center', gap: 20, margin: '20px 0 0' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.navy, display: 'grid', placeItems: 'center', color: C.goldCta, flexShrink: 0 }}>
          <Icon n="phone" size={22} />
        </div>
        <div>
          <ET e={e} field="tagline" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: C.navy }}>{c.tagline || 'CALL/TEXT TO GET STARTED'}</ET>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.navy }}>(801) 784-0095</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: C.navy, padding: '14px 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid rgba(201,168,76,.4)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <FoothillLogo size={40} bright />
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '.08em' }}>FOOTHILL WELLNESS<br /><span style={{ fontSize: 11, fontWeight: 500, color: C.goldCta, letterSpacing: '.18em', fontFamily: "'Inter',sans-serif" }}>FEEL BETTER FASTER</span></div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'rgba(255,255,255,.6)', fontSize: 13 }}><Icon n="pin" size={14} /><span>1414 S Foothill Drive #D, SLC, UT 84108</span></div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'rgba(255,255,255,.6)', fontSize: 13 }}><Icon n="phone" size={14} /><span>(801) 784-0095</span></div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'rgba(255,255,255,.6)', fontSize: 13 }}><Icon n="globe" size={14} /><span>foothillwellness.com</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 4: FULL BLEED ───────────────────────────────────────────────────
// Full image, dark overlay, logo box top-left, location tag top-right, headline, pill CTA
function Tpl4({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const hookLen = c.hook?.length || 0;
  const hSize = hookLen > 45 ? 74 : hookLen > 30 ? 90 : 108;

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy }}>
      <SmartImage srcs={img} pos={pos} />

      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(1,24,54,.65) 0%,rgba(1,24,54,.08) 30%,rgba(1,24,54,.08) 48%,rgba(1,24,54,.62) 72%,rgba(1,24,54,.97) 100%)' }} />

      {/* Top: logo box + location */}
      <div style={{ position: 'absolute', top: 48, left: 48, right: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: C.navy, borderRadius: 16, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid rgba(201,168,76,.25)` }}>
          <FoothillLogo size={36} bright />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '.06em' }}>FOOTHILL</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '.06em', marginTop: -2 }}>WELLNESS</div>
          </div>
        </div>
        <ET e={e} field="eyebrow" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldCta }}>
          {c.eyebrow}
        </ET>
      </div>

      {/* Bottom: hook + divider + subhook + pill CTA */}
      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 64 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: hSize, lineHeight: .95, color: '#fff', margin: 0, letterSpacing: '-.02em' }}>
          {hookParts(c.hook, c.emphasis).map((p, i) => (
            <span key={i} style={p.em ? { fontStyle: 'italic', color: C.goldCta } : undefined}>{p.t}</span>
          ))}
        </h2>

        <div style={{ height: 3, width: 72, background: C.goldCta, borderRadius: 2, margin: '24px 0' }} />

        <ET e={e} field="subhook" multi tag="p" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: 26, lineHeight: 1.45, color: 'rgba(255,255,255,.85)', margin: '0 0 32px', maxWidth: 700 }}>
          {c.subhook}
        </ET>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: C.goldCta, color: C.navy, padding: '18px 36px', borderRadius: 999, fontSize: 26, fontWeight: 800, fontFamily: "'Inter',sans-serif" }}>
          <Icon n="phone" size={24} />
          Call or text (801) 784-0095
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 5: QUOTE CARD ───────────────────────────────────────────────────
// Top image strip, bottom cream with large quote, attribution, stars, phone footer
function Tpl5({ c, img, pos, e }: { c: GraphicContent; img: string[] | null; pos?: { x: number; y: number }; e?: EditHandle }) {
  const quoteLen = c.quote?.length || 0;
  const qSize = quoteLen > 200 ? 34 : quoteLen > 140 ? 40 : quoteLen > 90 ? 48 : 56;

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif" }}>

      {/* Top image strip — 40% */}
      <div style={{ height: '40%', position: 'relative', background: C.navyDark, flexShrink: 0 }}>
        <SmartImage srcs={img} pos={pos} />
        {/* Top overlays */}
        <div style={{ position: 'absolute', top: 32, left: 44, right: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ background: C.navy, borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, border: `1px solid rgba(201,168,76,.3)` }}>
            <FoothillLogo size={32} bright />
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.06em' }}>FOOTHILL WELLNESS</div>
          </div>
          <ET e={e} field="eyebrow" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldCta }}>
            {c.eyebrow || 'Real Client Story'}
          </ET>
        </div>
      </div>

      {/* Bottom quote section */}
      <div style={{ flex: 1, padding: '44px 56px 0 56px', display: 'flex', flexDirection: 'column' }}>
        {/* Large gold quote mark */}
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 160, color: C.goldCta, lineHeight: .65, marginBottom: 8, opacity: .7 }}>&ldquo;</div>

        <ET e={e} field="quote" multi tag="blockquote" style={{
          fontFamily: "'Playfair Display',serif", fontStyle: 'italic',
          fontSize: qSize, lineHeight: 1.3, color: C.navyMid,
          margin: 0, paddingLeft: 32,
          borderLeft: `4px solid ${C.gold}`,
          letterSpacing: '-.01em',
          flex: 1,
        }}>
          {c.quote}
        </ET>

        {/* Attribution + stars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 24 }}>
          <div>
            <ET e={e} field="proofName" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 24, color: C.navy }}>
              {c.proofName}
            </ET>
            <ET e={e} field="proofMeta" style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, color: C.goldMuted, marginTop: 4 }}>
              {c.proofMeta}
            </ET>
          </div>
          <Stars size={30} />
        </div>
      </div>

      {/* Footer phone bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 56px', borderTop: `1.5px solid rgba(201,168,76,.3)`, marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.navy, display: 'grid', placeItems: 'center', color: C.goldCta }}>
            <Icon n="phone" size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.goldMuted }}>CALL OR TEXT</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.navy, lineHeight: 1 }}>(801) 784-0095</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 18, color: C.gold, lineHeight: 1.3 }}>Your body already knows how to heal.</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '.1em', color: C.navyMid, marginTop: 2 }}>WE HELP IT HEAL FASTER.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const TEMPLATES: { id: TemplateId; name: string; icon: string }[] = [
  { id: 'educate',   name: 'Split Info',     icon: 'layers' },
  { id: 'statement', name: 'Circular',       icon: 'target' },
  { id: 'proof',     name: 'Right Column',   icon: 'grid' },
  { id: 'photo',     name: 'Full Bleed',     icon: 'image' },
  { id: 'editorial', name: 'Quote Card',     icon: 'heart' },
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
  if (tpl === 'statement') return <Tpl2 {...props} />;
  if (tpl === 'proof')     return <Tpl3 {...props} />;
  if (tpl === 'photo')     return <Tpl4 {...props} />;
  if (tpl === 'editorial') return <Tpl5 {...props} />;
  return <Tpl1 {...props} />;
}
