'use client';
import React from 'react';
import type { FlyerContent, FlyerBenefit, FlyerStat } from '@/types';

// ── Brand tokens ─────────────────────────────────────────────
const NAVY  = '#011836';
const GOLD  = '#C9A84C';
const CREAM = '#F5F1E8';
const MID   = '#1a2540';

interface CanvasProps {
  content: FlyerContent;
  image?: string | null;
  /** called when user clicks a text node in edit mode */
  onEditField?: (field: string, value: string) => void;
  editMode?: boolean;
}

// Thin gold ornament rule
function Rule({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>
      <div style={{ flex: 1, height: 1, background: GOLD, opacity: .5 }} />
      <div style={{ width: 5, height: 5, background: GOLD, transform: 'rotate(45deg)' }} />
      <div style={{ flex: 1, height: 1, background: GOLD, opacity: .5 }} />
    </div>
  );
}

// Mountain SVG logo mark
function Mountains({ color = GOLD, size = 48 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 120 72" fill="none">
      <polygon points="60,4 100,68 20,68" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" />
      <polygon points="85,20 112,68 58,68" fill="none" stroke={color} strokeWidth="3.5" strokeLinejoin="round" />
      <polygon points="35,28 62,68 8,68" fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
      <line x1="52" y1="4" x2="60" y2="4" stroke={color} strokeWidth="2" />
      <line x1="60" y1="4" x2="68" y2="4" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function LogoBlock({ dark = false, size = 'md' }: { dark?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const color = dark ? GOLD : NAVY;
  const sub   = dark ? 'rgba(201,168,76,.6)' : 'rgba(1,24,54,.45)';
  const sizes = { sm: { title: 14, sub: 7, mtn: 28 }, md: { title: 18, sub: 8, mtn: 36 }, lg: { title: 26, sub: 10, mtn: 52 } }[size];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Mountains color={color} size={sizes.mtn} />
      <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: sizes.title, fontWeight: 900, color, letterSpacing: '.12em', textTransform: 'uppercase', lineHeight: 1 }}>
        Foothill<br /><span style={{ fontSize: sizes.title * 0.7, letterSpacing: '.28em' }}>— Wellness —</span>
      </div>
      <div style={{ fontSize: sizes.sub, letterSpacing: '.18em', textTransform: 'uppercase', color: sub, marginTop: 2 }}>Feel Better Faster.</div>
    </div>
  );
}

function BenefitRow({ b }: { b: FlyerBenefit }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${GOLD}`, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 13 }}>{b.icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: NAVY }}>{b.title}</div>
        {b.desc && <div style={{ fontSize: 10.5, color: '#5a6a8a', lineHeight: 1.4, marginTop: 1 }}>{b.desc}</div>}
      </div>
    </div>
  );
}

function StatPill({ s }: { s: FlyerStat }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 14px' }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: GOLD, lineHeight: 1 }}>{s.value}</div>
      <div style={{ fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginTop: 3 }}>{s.label}</div>
    </div>
  );
}

// ── TEMPLATE: SPLIT ─────────────────────────────────────────
// Left cream panel with text, right photo — like example 1
function TemplateSplit({ content, image }: { content: FlyerContent; image?: string | null }) {
  const [h1, h2] = content.headline.includes(' ') ? [content.headline.split(' ')[0], content.headline.slice(content.headline.indexOf(' ') + 1)] : [content.headline, ''];
  return (
    <div style={{ width: 816, height: 1056, display: 'flex', flexDirection: 'column', background: CREAM, fontFamily: 'Arial, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Main body */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Left panel */}
        <div style={{ width: 390, padding: '48px 44px 32px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
          <LogoBlock size="sm" />
          <div style={{ flex: 1, marginTop: 36 }}>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 62, fontWeight: 900, lineHeight: .95, color: NAVY, letterSpacing: '.02em', textTransform: 'uppercase' }}>
              {h1}
            </div>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 62, fontWeight: 900, lineHeight: .95, color: GOLD, letterSpacing: '.02em', textTransform: 'uppercase', marginTop: 2 }}>
              {h2}
            </div>
            <Rule style={{ margin: '18px 0' }} />
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: MID, lineHeight: 1.6 }}>
              {content.subheadline}
            </div>
            <div style={{ height: 1, background: GOLD, opacity: .3, margin: '18px 0' }} />
            {content.benefits.slice(0, 5).map((b, i) => <BenefitRow key={i} b={b} />)}
          </div>
        </div>

        {/* Curved divider */}
        <svg style={{ position: 'absolute', left: 350, top: 0, height: '100%', zIndex: 3 }} width="80" viewBox="0 0 80 700" preserveAspectRatio="none">
          <path d="M40,0 Q80,350 40,700 L80,700 L80,0 Z" fill={CREAM} />
          <path d="M40,0 Q80,350 40,700" fill="none" stroke={GOLD} strokeWidth="1.5" />
        </svg>

        {/* Right photo */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {image
            ? <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} alt="" />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a2540,#2d4a7a)', display: 'grid', placeItems: 'center' }}>
                <div style={{ color: 'rgba(201,168,76,.4)', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Photo</div>
              </div>}
        </div>
      </div>

      {/* Footer bar */}
      <div style={{ background: NAVY, padding: '16px 44px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <LogoBlock dark size="sm" />
        <div style={{ width: 1, height: 40, background: 'rgba(201,168,76,.3)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)' }}>A natural way to</div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: GOLD }}>{content.tagline}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)' }}>Call or Text</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: GOLD, letterSpacing: '.04em' }}>{content.cta}</div>
        </div>
      </div>
    </div>
  );
}

// ── TEMPLATE: HERO ──────────────────────────────────────────
// Logo top + split headline/photo + benefits grid + info band + footer — like example 2
function TemplateHero({ content, image }: { content: FlyerContent; image?: string | null }) {
  const [h1, h2] = content.headline.includes(' ') ? [content.headline.split(' ')[0], content.headline.slice(content.headline.indexOf(' ') + 1)] : [content.headline, ''];
  return (
    <div style={{ width: 816, height: 1056, display: 'flex', flexDirection: 'column', background: CREAM, fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
      {/* Top: logo bar */}
      <div style={{ padding: '20px 44px 0', display: 'flex', justifyContent: 'center' }}>
        <LogoBlock size="md" />
      </div>
      <Rule style={{ margin: '12px 44px' }} />

      {/* Split: text left + photo right */}
      <div style={{ display: 'flex', flex: '0 0 340px', position: 'relative' }}>
        <div style={{ flex: 1, padding: '12px 44px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 68, fontWeight: 900, lineHeight: .9, color: NAVY, textTransform: 'uppercase' }}>{h1}</div>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 68, fontWeight: 900, lineHeight: .9, color: GOLD, textTransform: 'uppercase', marginTop: 2 }}>{h2}</div>
          <Rule style={{ margin: '14px 0 10px' }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, color: MID, lineHeight: 1.5 }}>{content.subheadline}</div>
          <div style={{ fontSize: 11, color: '#5a6a8a', lineHeight: 1.6, marginTop: 8 }}>{content.description}</div>
        </div>
        {/* Photo */}
        <div style={{ width: 320, position: 'relative', overflow: 'hidden', borderRadius: '0 0 0 40px' }}>
          {image
            ? <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} alt="" />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a2540,#2d4a7a)' }} />}
          {/* Gold border accent */}
          <div style={{ position: 'absolute', inset: 0, border: `2px solid ${GOLD}`, borderRadius: '0 0 0 40px', opacity: .4, pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Benefits grid — dark navy */}
      <div style={{ background: NAVY, padding: '20px 44px', display: 'flex', gap: 0 }}>
        {content.benefits.slice(0, 6).map((b, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '0 8px', borderRight: i < Math.min(content.benefits.length, 6) - 1 ? '1px solid rgba(201,168,76,.15)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, margin: '0 auto 6px' }}>{b.icon}</div>
            <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: GOLD, lineHeight: 1.3 }}>{b.title}</div>
            {b.desc && <div style={{ fontSize: 8, color: 'rgba(255,255,255,.55)', lineHeight: 1.35, marginTop: 3 }}>{b.desc}</div>}
          </div>
        ))}
      </div>

      {/* Stats band + secondary info */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left: circle image */}
        <div style={{ width: 260, padding: '24px 0 24px 44px', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${GOLD}` }}>
            {image
              ? <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <div style={{ width: '100%', height: '100%', background: '#1a2540' }} />}
          </div>
        </div>
        {/* Right: tagline + description */}
        <div style={{ flex: 1, padding: '24px 44px 24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 8 }}>A natural way to</div>
          <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: NAVY, lineHeight: 1.3 }}>{content.tagline}</div>
          <Rule style={{ margin: '12px 0' }} />
          <div style={{ fontSize: 11, color: '#5a6a8a', lineHeight: 1.6 }}>{content.description}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: NAVY, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 32 }}>
        <LogoBlock dark size="sm" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 9, color: 'rgba(201,168,76,.55)', letterSpacing: '.1em' }}>📍 1414 S Foothill Drive, #D · Salt Lake City, UT 84108</div>
          <div style={{ fontSize: 9, color: 'rgba(201,168,76,.55)', letterSpacing: '.1em' }}>🌐 foothillwellness.com</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)' }}>Call or Text</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: GOLD }}>{content.cta}</div>
          <div style={{ fontSize: 9, fontStyle: 'italic', color: 'rgba(201,168,76,.5)' }}>Your body already knows how to heal. We help it heal faster.</div>
        </div>
      </div>
    </div>
  );
}

// ── TEMPLATE: CHECKLIST ─────────────────────────────────────
// Large service name + checklist left, full photo right, stats bar — like example 3
function TemplateChecklist({ content, image }: { content: FlyerContent; image?: string | null }) {
  const [h1, h2] = content.headline.includes(' ') ? [content.headline.split(' ')[0], content.headline.slice(content.headline.indexOf(' ') + 1)] : [content.headline, ''];
  return (
    <div style={{ width: 816, height: 1056, display: 'flex', flexDirection: 'column', background: CREAM, fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
      {/* Top: split */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left */}
        <div style={{ width: 420, padding: '44px 40px 32px', display: 'flex', flexDirection: 'column', background: CREAM }}>
          {/* Snow/cryo icon accent */}
          <div style={{ fontSize: 22, color: GOLD, marginBottom: 8 }}>✦</div>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 82, fontWeight: 900, lineHeight: .85, color: NAVY, textTransform: 'uppercase' }}>{h1}</div>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 82, fontWeight: 900, lineHeight: .85, color: GOLD, textTransform: 'uppercase', marginTop: 4 }}>{h2}</div>
          <Rule style={{ margin: '16px 0 12px' }} />
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: MID, marginBottom: 10 }}>{content.subheadline}</div>
          <div style={{ fontSize: 10.5, color: '#5a6a8a', lineHeight: 1.6, marginBottom: 16 }}>{content.description}</div>
          {/* Checklist */}
          {content.benefits.slice(0, 6).map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${GOLD}`, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                <div style={{ fontSize: 8, color: GOLD, fontWeight: 900 }}>✓</div>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: NAVY }}>{b.title}</div>
            </div>
          ))}
        </div>
        {/* Right: full photo */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {image
            ? <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} alt="" />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#0a2a50,#1a2540)' }} />}
        </div>
      </div>

      {/* Stats bar */}
      {content.stats.length > 0 && (
        <div style={{ background: NAVY, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* Left callout */}
          <div style={{ marginRight: 24, paddingRight: 24, borderRight: '1px solid rgba(201,168,76,.2)' }}>
            {content.stats.slice(0, 1).map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 20, fontWeight: 900, color: GOLD }}>{s.value}</div>
                <div style={{ fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Right icons */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around' }}>
            {content.benefits.slice(0, 5).map((b, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{b.icon}</div>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)' }}>{b.title.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: CREAM, borderTop: `2px solid ${GOLD}`, padding: '16px 44px', display: 'flex', alignItems: 'center', gap: 32 }}>
        <LogoBlock size="sm" />
        <div style={{ width: 1, height: 44, background: 'rgba(1,24,54,.15)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 9.5, color: '#5a6a8a', letterSpacing: '.08em' }}>📍 1414 S Foothill Drive, #D · Salt Lake City, UT 84108</div>
          <div style={{ fontSize: 9.5, color: '#5a6a8a', letterSpacing: '.08em' }}>🌐 foothillwellness.com</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: GOLD }}>Call or Text</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>{content.cta}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────
export default function FlyerCanvas({ content, image }: CanvasProps) {
  if (content.template === 'hero')      return <TemplateHero content={content} image={image} />;
  if (content.template === 'checklist') return <TemplateChecklist content={content} image={image} />;
  return <TemplateSplit content={content} image={image} />;
}
