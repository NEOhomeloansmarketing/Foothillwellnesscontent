'use client';
import { useState, useRef, useCallback } from 'react';
import { toJpeg } from 'html-to-image';
import type { ContentPiece, FlyerContent, FlyerBenefit, FlyerStat } from '@/types';
import FlyerCanvas from './flyer/FlyerCanvas';

interface Props {
  current: ContentPiece;
  onUpdate: (p: ContentPiece) => void;
  onToast: (msg: string) => void;
}

const TEMPLATES: { id: FlyerContent['template']; label: string; desc: string }[] = [
  { id: 'split',     label: 'Split Panel',  desc: 'Text left, photo right with curved divider' },
  { id: 'hero',      label: 'Hero Grid',    desc: 'Photo hero + 6-benefit grid + secondary band' },
  { id: 'checklist', label: 'Checklist',    desc: 'Large headline + checkmark list + stats bar' },
];

function FieldRow({ label, value, onSave, multiline = false }: { label: string; value: string; onSave: (v: string) => void; multiline?: boolean }) {
  const [draft, setDraft] = useState(value);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)', display: 'block', marginBottom: 4 }}>{label}</label>
      {multiline
        ? <textarea rows={3} value={draft} onChange={e => setDraft(e.target.value)} onBlur={() => onSave(draft)}
            style={{ width: '100%', fontSize: 12.5, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--cream)', color: 'var(--navy-mid)', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }} />
        : <input value={draft} onChange={e => setDraft(e.target.value)} onBlur={() => onSave(draft)}
            style={{ width: '100%', fontSize: 12.5, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--cream)', color: 'var(--navy-mid)', fontFamily: 'inherit' }} />}
    </div>
  );
}

export default function FlyerEditor({ current, onUpdate, onToast }: Props) {
  const [tab, setTab] = useState<'template' | 'content' | 'benefits'>('template');
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const fc = current.flyerContent ?? {
    template: 'split' as const,
    headline: 'LOADING…',
    subheadline: '',
    description: '',
    benefits: [],
    stats: [],
    tagline: 'Feel Better Faster',
    cta: '(801) 784-0095',
  } satisfies FlyerContent;

  const isLoading = fc.headline === 'LOADING…';
  const img = Array.isArray(current.autoImage) ? current.autoImage[0] : current.autoImage;

  function updateFc(partial: Partial<FlyerContent>) {
    onUpdate({ ...current, flyerContent: { ...fc, ...partial } });
  }

  function updateBenefit(i: number, partial: Partial<FlyerBenefit>) {
    const benefits = fc.benefits.map((b, idx) => idx === i ? { ...b, ...partial } : b);
    updateFc({ benefits });
  }

  function updateStat(i: number, partial: Partial<FlyerStat>) {
    const stats = fc.stats.map((s, idx) => idx === i ? { ...s, ...partial } : s);
    updateFc({ stats });
  }

  const downloadPDF = useCallback(async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toJpeg(canvasRef.current, { quality: 0.97, pixelRatio: 2, skipFonts: true });
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, 8.5, 11);
      pdf.save(`${current.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-flyer.pdf`);
      onToast('Flyer downloaded as PDF!');
    } catch {
      onToast('Download failed — try again');
    }
    setDownloading(false);
  }, [current.title, onToast]);

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>

      {/* ── LEFT: flyer preview ── */}
      <div className="scrolly" style={{ flex: '1 1 60%', overflowY: 'auto', background: '#E8E4DC', padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--muted)', gap: 16 }}>
            <div className="spin" style={{ width: 40, height: 40 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Generating your flyer…</div>
          </div>
        ) : (
          <>
            {/* Scaled preview */}
            <div style={{ position: 'relative' }}>
              <div ref={canvasRef} style={{ transformOrigin: 'top left', transform: 'scale(0.62)', width: 816, height: 1056, marginBottom: -(1056 * 0.38), marginRight: -(816 * 0.38) }}>
                <FlyerCanvas content={fc} image={img} />
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={downloadPDF}
              disabled={downloading}
              style={{
                marginTop: 8, padding: '12px 32px', borderRadius: 12, border: 'none',
                background: downloading ? 'var(--line-soft)' : 'var(--navy-deep)',
                color: downloading ? 'var(--muted)' : 'var(--gold-cta)',
                fontSize: 13, fontWeight: 800, cursor: downloading ? 'not-allowed' : 'pointer',
                letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {downloading ? <><div className="spin" style={{ width: 16, height: 16 }} /> Generating PDF…</> : '↓ Download PDF'}
            </button>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>US Letter · 8.5" × 11" · print-ready</div>
          </>
        )}
      </div>

      {/* ── RIGHT: edit panel ── */}
      <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid var(--line)', overflow: 'hidden' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          {(['template', 'content', 'benefits'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '12px 4px', fontSize: 11.5, fontWeight: tab === t ? 700 : 500,
              color: tab === t ? 'var(--navy-mid)' : 'var(--muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
              textTransform: 'capitalize', letterSpacing: '.02em',
            }}>{t}</button>
          ))}
        </div>

        <div className="scrolly" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

          {/* TEMPLATE TAB */}
          {tab === 'template' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, lineHeight: 1.5 }}>Pick a layout. The content stays the same — only the design changes.</div>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => updateFc({ template: t.id })}
                  style={{
                    textAlign: 'left', padding: '14px 16px', borderRadius: 10,
                    background: fc.template === t.id ? 'var(--navy-deep)' : 'var(--cream)',
                    border: `1.5px solid ${fc.template === t.id ? 'var(--navy-deep)' : 'var(--line)'}`,
                    cursor: 'pointer',
                  }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: fc.template === t.id ? 'var(--gold-cta)' : 'var(--navy-mid)', marginBottom: 3 }}>
                    {fc.template === t.id ? '✓ ' : ''}{t.label}
                  </div>
                  <div style={{ fontSize: 11, color: fc.template === t.id ? 'rgba(255,255,255,.6)' : 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* CONTENT TAB */}
          {tab === 'content' && (
            <>
              <FieldRow label="Headline" value={fc.headline} onSave={v => updateFc({ headline: v })} />
              <FieldRow label="Subheadline" value={fc.subheadline} onSave={v => updateFc({ subheadline: v })} />
              <FieldRow label="Description" value={fc.description} onSave={v => updateFc({ description: v })} multiline />
              <FieldRow label="Tagline" value={fc.tagline} onSave={v => updateFc({ tagline: v })} />
              <FieldRow label="Phone / CTA" value={fc.cta} onSave={v => updateFc({ cta: v })} />
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 8 }}>Stats</div>
              {fc.stats.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input value={s.value} onChange={e => updateStat(i, { value: e.target.value })}
                    placeholder="Value" style={{ width: 80, fontSize: 12, padding: '7px 9px', borderRadius: 7, border: '1.5px solid var(--line)', background: 'var(--cream)', color: 'var(--navy-mid)', fontFamily: 'inherit', fontWeight: 700 }} />
                  <input value={s.label} onChange={e => updateStat(i, { label: e.target.value })}
                    placeholder="Label" style={{ flex: 1, fontSize: 12, padding: '7px 9px', borderRadius: 7, border: '1.5px solid var(--line)', background: 'var(--cream)', color: 'var(--navy-mid)', fontFamily: 'inherit' }} />
                </div>
              ))}
              <button onClick={() => updateFc({ stats: [...fc.stats, { value: '', label: '' }] })}
                style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy-mid)', background: 'var(--cream)', border: '1px dashed var(--line)', borderRadius: 7, padding: '7px 12px', cursor: 'pointer', width: '100%', marginTop: 4 }}>
                + Add stat
              </button>
            </>
          )}

          {/* BENEFITS TAB */}
          {tab === 'benefits' && (
            <>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>Edit each benefit that appears in the flyer. Icon can be any emoji.</div>
              {fc.benefits.map((b, i) => (
                <div key={i} style={{ background: 'var(--cream)', borderRadius: 10, padding: '12px', marginBottom: 10, border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={b.icon} onChange={e => updateBenefit(i, { icon: e.target.value })}
                      style={{ width: 44, fontSize: 18, textAlign: 'center', padding: '5px', borderRadius: 7, border: '1.5px solid var(--line)', background: '#fff' }} />
                    <input value={b.title} onChange={e => updateBenefit(i, { title: e.target.value })}
                      placeholder="Benefit title" style={{ flex: 1, fontSize: 12, padding: '7px 9px', borderRadius: 7, border: '1.5px solid var(--line)', background: '#fff', color: 'var(--navy-mid)', fontFamily: 'inherit', fontWeight: 700 }} />
                  </div>
                  <input value={b.desc} onChange={e => updateBenefit(i, { desc: e.target.value })}
                    placeholder="Short description…" style={{ width: '100%', fontSize: 11.5, padding: '7px 9px', borderRadius: 7, border: '1.5px solid var(--line)', background: '#fff', color: 'var(--navy-mid)', fontFamily: 'inherit' }} />
                </div>
              ))}
              <button onClick={() => updateFc({ benefits: [...fc.benefits, { icon: '✦', title: '', desc: '' }] })}
                style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy-mid)', background: 'var(--cream)', border: '1px dashed var(--line)', borderRadius: 7, padding: '7px 12px', cursor: 'pointer', width: '100%', marginTop: 4 }}>
                + Add benefit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
