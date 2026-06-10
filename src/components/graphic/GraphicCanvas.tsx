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

interface EditHandle { on: boolean; set: (field: string, val: string) => void; }

function StripePlaceholder({ label = 'DROP CLIENT PHOTO' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg,${C.navyDark} 0 28px,${C.navyMid} 28px 56px)`, display: 'grid', placeItems: 'center' }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 30, letterSpacing: '.18em', color: 'rgba(209,187,116,.62)', border: '2px dashed rgba(209,187,116,.4)', padding: '22px 34px', borderRadius: 14 }}>{label}</div>
    </div>
  );
}

function SmartImage({ srcs }: { srcs: string[] | null }) {
  const [i, setI] = useState(0);
  const firstSrc = srcs?.[0];
  // reset index when the image set changes
  useEffect(() => { setI(0); }, [firstSrc]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!srcs || i >= srcs.length) return <StripePlaceholder label="AI IMAGE" />;
  return (
    <img src={srcs[i]} onError={() => setI(v => v + 1)} crossOrigin="anonymous"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
  );
}

function LogoPlaque({ size = 78, corner = false }: { size?: number; corner?: boolean }) {
  return (
    <img src="/foothill-logo.png" alt=""
      style={{ height: size, borderRadius: size * 0.12, boxShadow: corner ? '0 10px 30px rgba(0,0,0,.35)' : 'none', display: 'block' }} />
  );
}

function CtaPill({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: dark ? C.navy : C.goldCta, color: dark ? C.goldCta : C.navy, padding: '18px 30px', borderRadius: 999, fontSize: 27, fontWeight: 700, fontFamily: "'Inter',sans-serif", letterSpacing: '.01em', boxShadow: '0 8px 24px rgba(1,24,54,.18)' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>
      {text}
    </div>
  );
}

function EdText({ e, field, tag = 'div', multi, style, children }: {
  e?: EditHandle; field: string; tag?: 'div' | 'h1' | 'h3' | 'p' | 'blockquote'; multi?: boolean; style?: React.CSSProperties; children?: React.ReactNode;
}) {
  const editable = e?.on;
  const props: React.HTMLAttributes<HTMLElement> & { contentEditable?: boolean; suppressContentEditableWarning?: boolean; spellCheck?: boolean } = {
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
  return tag === 'div' ? <div {...props}>{children}</div>
    : tag === 'h1' ? <h1 {...props}>{children}</h1>
    : tag === 'h3' ? <h3 {...props}>{children}</h3>
    : tag === 'p' ? <p {...props}>{children}</p>
    : tag === 'blockquote' ? <blockquote {...props}>{children}</blockquote>
    : <div {...props}>{children}</div>;
}

function hookParts(hook: string, emphasis?: string) {
  if (!emphasis) return [{ t: hook, em: false }];
  const i = hook.toLowerCase().indexOf(emphasis.toLowerCase());
  if (i < 0) return [{ t: hook, em: false }];
  return [{ t: hook.slice(0, i), em: false }, { t: hook.slice(i, i + emphasis.length), em: true }, { t: hook.slice(i + emphasis.length), em: false }];
}

function Hook({ hook, emphasis, size, color = C.white, emColor = C.goldCta, align = 'left', e }: {
  hook: string; emphasis?: string; size: number; color?: string; emColor?: string; align?: string; e?: EditHandle;
}) {
  const editable = e?.on;
  return (
    <h2 className={editable ? 'ged' : undefined}
      contentEditable={editable || undefined} suppressContentEditableWarning spellCheck={false}
      onBlur={editable ? (ev: React.FocusEvent<HTMLElement>) => { const t = ev.currentTarget.innerText.trim(); if (t && e?.set) e.set('hook', t); } : undefined}
      onKeyDown={editable ? (ev: React.KeyboardEvent) => { if (ev.key === 'Enter') { ev.preventDefault(); (ev.currentTarget as HTMLElement).blur(); } } : undefined}
      style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: size, lineHeight: 1.06, color, margin: 0, textAlign: align as 'left', letterSpacing: '-.01em' }}>
      {hookParts(hook, emphasis).map((p, i) => <span key={i} style={p.em ? { fontStyle: 'italic', color: emColor } : undefined}>{p.t}</span>)}
    </h2>
  );
}

function Bullet({ icon, children, e, field }: { icon: string; children: React.ReactNode; e?: EditHandle; field: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ width: 42, height: 42, flex: 'none', borderRadius: '50%', border: `2px solid ${C.gold}`, display: 'grid', placeItems: 'center', color: C.gold }}>
        <Icon n={icon} size={22} sw={1.8} />
      </span>
      <EdText e={e} field={field} style={{ fontFamily: "'Inter',sans-serif", fontSize: 21, fontWeight: 500, color: C.navyMid, lineHeight: 1.2 }}>{children}</EdText>
    </div>
  );
}

function TplStatement({ c, img, e }: { c: GraphicContent; img: string[] | null; e?: EditHandle }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(130% 120% at 90% 0%,rgba(209,187,116,.14),transparent 52%),linear-gradient(165deg,${C.navy},${C.navyMid})`, padding: 96, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <EdText e={e} field="eyebrow" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 23, letterSpacing: '.24em', textTransform: 'uppercase', color: C.goldCta, whiteSpace: 'nowrap' }}>{c.eyebrow}</EdText>
        <div style={{ width: 78, height: 78, opacity: .9, flex: 'none' }}><Peaks color={C.goldCta} w={120} /></div>
      </div>
      <div>
        <Hook hook={c.hook} emphasis={c.emphasis} size={c.hook.length > 40 ? 74 : 88} e={e} />
        <div style={{ width: 90, height: 4, background: C.gold, borderRadius: 3, margin: '40px 0 30px' }} />
        <EdText e={e} field="subhook" multi tag="p" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 31, lineHeight: 1.5, color: 'rgba(255,255,255,.82)', maxWidth: 760, margin: 0 }}>{c.subhook}</EdText>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LogoPlaque size={88} />
        <CtaPill text={c.ctaShort || '(801) 784-0095'} />
      </div>
    </div>
  );
}

function TplProof({ c, img, e }: { c: GraphicContent; img: string[] | null; e?: EditHandle }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.beige, padding: 70 }}>
      <div style={{ position: 'absolute', inset: 40, border: `2px solid ${C.gold}`, borderRadius: 18, opacity: .5 }} />
      <div style={{ position: 'relative', height: '100%', padding: 52, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <EdText e={e} field="eyebrow" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 21, letterSpacing: '.24em', textTransform: 'uppercase', color: C.goldMuted, marginBottom: 6 }}>{c.eyebrow || 'Real Client Story'}</EdText>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 200, lineHeight: .5, color: C.gold, height: 90, marginTop: 30 }}>&ldquo;</div>
        </div>
        <EdText e={e} field="quote" multi tag="blockquote" style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: c.quote && c.quote.length > 150 ? 46 : 56, lineHeight: 1.28, color: C.navyMid, margin: 0, letterSpacing: '-.01em' }}>{c.quote}</EdText>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <EdText e={e} field="proofName" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 28, color: C.navy }}>{c.proofName}</EdText>
            <EdText e={e} field="proofMeta" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 500, fontSize: 23, color: C.goldMuted, marginTop: 4 }}>{c.proofMeta}</EdText>
          </div>
          <LogoPlaque size={78} />
        </div>
      </div>
    </div>
  );
}

function TplPhoto({ c, img, e }: { c: GraphicContent; img: string[] | null; e?: EditHandle }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy }}>
      {img ? <SmartImage srcs={img} /> : <StripePlaceholder />}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg,rgba(1,24,54,.45) 0%,transparent 28%,transparent 42%,rgba(1,24,54,.55) 70%,rgba(1,24,54,.92) 100%)` }} />
      <div style={{ position: 'absolute', top: 54, right: 54 }}><LogoPlaque size={72} corner /></div>
      <div style={{ position: 'absolute', left: 80, right: 80, bottom: 84 }}>
        <EdText e={e} field="eyebrow" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: '.24em', textTransform: 'uppercase', color: C.goldCta, marginBottom: 22, whiteSpace: 'nowrap' }}>{c.eyebrow}</EdText>
        <Hook hook={c.hook} emphasis={c.emphasis} size={c.hook.length > 40 ? 70 : 82} e={e} />
        <div style={{ marginTop: 36 }}><CtaPill text={c.ctaShort || 'Call/text (801) 784-0095'} /></div>
      </div>
    </div>
  );
}

function TplEditorial({ c, img, e }: { c: GraphicContent; img: string[] | null; e?: EditHandle }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '0 0 60%', background: `linear-gradient(160deg,${C.navy},${C.navyMid})`, padding: '90px 88px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <EdText e={e} field="eyebrow" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: '.24em', textTransform: 'uppercase', color: C.goldCta, marginBottom: 28, whiteSpace: 'nowrap' }}>{c.eyebrow}</EdText>
        <Hook hook={c.hook} emphasis={c.emphasis} size={c.hook.length > 40 ? 70 : 84} e={e} />
        <div style={{ position: 'absolute', right: 88, top: 90, opacity: .85 }}><Peaks color={C.goldCta} w={130} /></div>
      </div>
      <div style={{ height: 6, background: `linear-gradient(90deg,${C.gold},${C.goldCta})` }} />
      <div style={{ flex: 1, background: C.cream, padding: '0 88px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>
        <div style={{ flex: 1 }}>
          <EdText e={e} field="subhook" multi tag="p" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: 30, lineHeight: 1.5, color: C.navyDark, margin: 0, maxWidth: 560 }}>{c.subhook}</EdText>
          <div style={{ marginTop: 30 }}><CtaPill text={c.ctaShort || '(801) 784-0095'} /></div>
        </div>
        <LogoPlaque size={92} />
      </div>
    </div>
  );
}

function TplEducate({ c, img, e }: { c: GraphicContent; img: string[] | null; e?: EditHandle }) {
  const benefits = c.benefits || [];
  const q = (c.quote || '').replace(/^["""]|["""]$/g, '');
  const shortQ = q.length > 120 ? q.slice(0, 118).replace(/\s+\S*$/, '') + '…' : q;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ width: '56%', padding: '42px 32px 22px 58px', display: 'flex', flexDirection: 'column', gap: 15 }}>
          <img src="/foothill-logo.png" alt="" style={{ height: 52, borderRadius: 7, alignSelf: 'flex-start' }} />
          <div>
            <EdText e={e} field="title" tag="h1" style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: c.title && c.title.length > 14 ? 50 : 60, lineHeight: .98, color: C.navyMid, margin: 0, letterSpacing: '-.01em', textTransform: 'uppercase' }}>{c.title}</EdText>
            <EdText e={e} field="tagline" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '.1em', textTransform: 'uppercase', color: C.gold, marginTop: 9 }}>{c.tagline}</EdText>
          </div>
          <div>
            <EdText e={e} field="problemHook" tag="h3" style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 26, lineHeight: 1.1, color: C.navyMid, margin: 0, textTransform: 'uppercase', letterSpacing: '.005em' }}>
              {hookParts(c.problemHook, c.problemEmphasis).map((p, i) => <span key={i} style={p.em ? { fontStyle: 'italic', color: C.gold } : undefined}>{p.t}</span>)}
            </EdText>
            <EdText e={e} field="problemDesc" multi tag="p" style={{ fontFamily: "'Inter',sans-serif", fontSize: 19, lineHeight: 1.42, color: '#5a6273', marginTop: 11 }}>{c.problemDesc}</EdText>
          </div>
          <EdText e={e} field="aspiration" multi style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 21, lineHeight: 1.32, color: C.navyMid, borderLeft: `4px solid ${C.gold}`, paddingLeft: 18 }}>{c.aspiration}</EdText>
          <div style={{ marginTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13 }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '.1em', textTransform: 'uppercase', color: C.navyMid, whiteSpace: 'nowrap' }}>{c.title} can help</span>
              <span style={{ flex: 1, height: 2, background: C.gold, opacity: .5 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {benefits.map((b, i) => <Bullet key={i} icon={b[0]} e={e} field={`benefit:${i}`}>{b[1]}</Bullet>)}
            </div>
          </div>
        </div>
        <div style={{ width: '44%', position: 'relative', background: C.navyDark }}>
          {img ? <SmartImage srcs={img} /> : <StripePlaceholder />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(1,24,54,.14),transparent 28%,transparent 52%,rgba(1,24,54,.4))' }} />
          {shortQ && (
            <div style={{ position: 'absolute', top: 30, right: 26, width: 248, background: C.goldCta, color: C.navy, padding: '20px 22px', borderRadius: '46% 54% 56% 44% / 52% 46% 54% 48%', boxShadow: '0 14px 34px rgba(1,24,54,.3)' }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 18, lineHeight: 1.32, color: C.navy }}>&ldquo;{shortQ}&rdquo;</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: C.navyDark, marginTop: 8, opacity: .8 }}>— {c.proofName || 'Foothill Client'}</div>
            </div>
          )}
          <div style={{ position: 'absolute', left: 24, right: 24, bottom: 24, background: C.navy, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ color: C.goldCta, flex: 'none' }}><Icon n="calendar" size={30} sw={1.6} /></span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '.03em', color: '#fff', whiteSpace: 'nowrap' }}>FEEL BETTER. FASTER.</div>
              <EdText e={e} field="speed" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: 16.5, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{c.speed}</EdText>
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: 'none', borderTop: `2px solid ${C.gold}`, background: C.cream, padding: '22px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: '50%', background: C.gold, color: C.navy, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon n="phone" size={24} /></span>
          <div><div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '.12em', color: C.goldMuted }}>CALL / TEXT</div><div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 25, color: C.navyMid }}>(801) 784-0095</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: '50%', background: C.gold, color: C.navy, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon n="pin" size={24} /></span>
          <div><div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 19, color: C.navyMid }}>Foothill Wellness</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, color: '#6a7283' }}>Salt Lake City, UT</div></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 21, color: C.gold, lineHeight: 1.2 }}>Your body already knows how to heal.</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '.08em', color: C.navyMid, marginTop: 3 }}>WE HELP IT HEAL FASTER.</div>
        </div>
      </div>
    </div>
  );
}

export const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: 'educate', name: 'Educate' },
  { id: 'statement', name: 'Statement' },
  { id: 'proof', name: 'Proof' },
  { id: 'photo', name: 'Photo' },
  { id: 'editorial', name: 'Split' },
];

interface GraphicCanvasProps {
  tpl: TemplateId;
  content: GraphicContent;
  img?: string | string[] | null;
  edit?: EditHandle;
}

export default function GraphicCanvas({ tpl, content, img, edit }: GraphicCanvasProps) {
  const srcs = img ? (Array.isArray(img) ? img : [img]) : null;
  const props = { c: content, img: srcs, e: edit };
  if (tpl === 'statement') return <TplStatement {...props} />;
  if (tpl === 'proof') return <TplProof {...props} />;
  if (tpl === 'photo') return <TplPhoto {...props} />;
  if (tpl === 'editorial') return <TplEditorial {...props} />;
  return <TplEducate {...props} />;
}
