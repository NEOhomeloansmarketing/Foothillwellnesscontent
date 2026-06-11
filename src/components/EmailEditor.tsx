'use client';
import { useState, useRef } from 'react';
import type { ContentPiece, EmailContent } from '@/types';
import { getReviewsForService } from '@/lib/testimonials';

interface Props {
  current: ContentPiece;
  onUpdate: (p: ContentPiece) => void;
  onToast: (msg: string) => void;
}

function assembleFullEmail(ec: EmailContent): string {
  const lines = [
    `Subject: ${ec.subject}`,
    `Preview: ${ec.previewText}`,
    '',
    ec.opening,
    '',
    ec.empathy,
    '',
    ec.explanation,
    '',
    ec.proof,
    '',
    ec.speed,
    '',
    ec.ease,
    '',
    ec.cta,
    '',
    ec.closing,
  ];
  if (ec.ps) lines.push('', `P.S. ${ec.ps}`);
  return lines.join('\n');
}

// Inline-editable block in the preview
function EditableBlock({
  value, fieldKey, tag = 'p', style, onSave, placeholder,
}: {
  value: string; fieldKey: string; tag?: 'p' | 'div' | 'h2';
  style?: React.CSSProperties; onSave: (v: string) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const Tag = tag;

  return (
    <Tag
      ref={ref as React.RefObject<HTMLParagraphElement>}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={e => {
        setFocused(false);
        const v = e.currentTarget.innerText.trim();
        if (v && v !== value) onSave(v);
      }}
      style={{
        outline: 'none',
        borderRadius: 6,
        padding: '4px 6px',
        margin: '0 -6px',
        border: focused
          ? '1.5px solid #C9A84C'
          : '1.5px solid transparent',
        cursor: 'text',
        transition: 'border-color .15s',
        minHeight: 24,
        ...style,
      }}
    >
      {value}
    </Tag>
  );
}

export default function EmailEditor({ current, onUpdate, onToast }: Props) {
  const [tab, setTab] = useState<'reviews' | 'ai'>('ai');
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [ghlSending, setGhlSending] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const ec = current.emailContent ?? {
    subject: '', previewText: '', opening: '', empathy: '',
    explanation: '', proof: '', speed: '', ease: '',
    cta: 'Call or text (801) 784-0095 — we\'re here to help you figure out what\'s right for you.',
    closing: 'Foothill Wellness Team', ps: '',
  } as EmailContent;

  const reviews = getReviewsForService(current.service);
  const isLoading = ec.subject === 'Writing your email…';

  function update(key: keyof EmailContent, value: string) {
    onUpdate({ ...current, emailContent: { ...ec, [key]: value } });
  }

  function updateAll(data: Partial<EmailContent>) {
    onUpdate({ ...current, emailContent: { ...ec, ...data } });
  }

  function selectReview(review: { name: string; text: string }) {
    const trimmed = review.text.length > 220
      ? review.text.slice(0, 218).replace(/\s+\S*$/, '') + '…'
      : review.text;
    const proofLine = `"${trimmed}" — ${review.name}`;
    update('proof', proofLine);
    onToast(`Review updated — ${review.name}`);
  }

  async function sendToGHL() {
    if (ghlSending) return;
    setGhlSending(true);
    try {
      const res = await fetch('/api/ghl-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ec, title: current.title }),
      });
      const json = await res.json();
      if (json.ok) {
        onToast('Email template created in GHL — open Email Marketing to send it');
      } else {
        onToast(`GHL error: ${json.error ?? 'Unknown error'}`);
      }
    } catch {
      onToast('Network error — could not reach GHL');
    }
    setGhlSending(false);
  }

  async function sendAI() {
    const t = aiDraft.trim();
    if (!t || aiLoading) return;
    setAiHistory(h => [...h, { role: 'user', text: t }]);
    setAiDraft('');
    setAiLoading(true);
    setTimeout(() => feedRef.current?.scrollTo(0, 99999), 50);

    try {
      const res = await fetch('/api/refine-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: t, email: ec, service: current.service }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        updateAll(json.data);
        setAiHistory(h => [...h, { role: 'ai', text: 'Done — email updated. Click any section in the preview to keep editing.' }]);
      } else {
        setAiHistory(h => [...h, { role: 'ai', text: 'Something went wrong — try again.' }]);
      }
    } catch {
      setAiHistory(h => [...h, { role: 'ai', text: 'Network error — try again.' }]);
    }
    setAiLoading(false);
    setTimeout(() => feedRef.current?.scrollTo(0, 99999), 50);
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>

      {/* ── LEFT: Inline-editable preview ── */}
      <div className="scrolly" style={{ flex: '1 1 55%', overflowY: 'auto', background: '#F0EDE6', padding: '28px 20px', borderRight: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          {/* Meta row */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)', minWidth: 52 }}>Subject</span>
              <EditableBlock
                value={ec.subject} fieldKey="subject"
                onSave={v => update('subject', v)}
                style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-mid)', flex: 1 }}
                placeholder="Subject line…"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)', minWidth: 52 }}>Preview</span>
              <EditableBlock
                value={ec.previewText} fieldKey="previewText"
                onSave={v => update('previewText', v)}
                style={{ fontSize: 12, color: 'var(--muted)', flex: 1 }}
                placeholder="Preview text…"
              />
            </div>
          </div>

          {/* Email card */}
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 32px rgba(1,24,54,.10)' }}>

            {/* Header */}
            <div style={{ background: '#011836', padding: '24px 40px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color: '#C9A84C', letterSpacing: '.04em' }}>
                Foothill Wellness
              </div>
              <div style={{ fontSize: 11, color: 'rgba(201,168,76,.65)', marginTop: 3, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                Feel Better Faster
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '32px 40px 24px', color: '#1a2540' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                  <div className="spin" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Writing your email with AI…</div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: '#1a2540', margin: '0 0 4px', fontWeight: 600 }}>Hello,</p>

                  <EditableBlock value={ec.opening} fieldKey="opening" onSave={v => update('opening', v)}
                    style={{ fontSize: 15, lineHeight: 1.75, color: '#1a2540', marginBottom: 18, display: 'block' }} placeholder="Opening paragraph…" />

                  <EditableBlock value={ec.empathy} fieldKey="empathy" onSave={v => update('empathy', v)}
                    style={{ fontSize: 15, lineHeight: 1.75, color: '#3a4a6a', marginBottom: 20, display: 'block' }} placeholder="Empathy paragraph…" />

                  <div style={{ borderLeft: '3px solid #C9A84C', borderRadius: '0 8px 8px 0', background: '#FAF8F3', padding: '14px 18px', marginBottom: 20 }}>
                    <EditableBlock value={ec.explanation} fieldKey="explanation" onSave={v => update('explanation', v)}
                      style={{ fontSize: 14.5, lineHeight: 1.7, color: '#1a2540', display: 'block' }} placeholder="Service explanation…" />
                  </div>

                  <div style={{ background: '#FAF8F3', borderRadius: 10, padding: '16px 20px', marginBottom: 20, borderTop: '2px solid #C9A84C' }}>
                    <EditableBlock value={ec.proof} fieldKey="proof" onSave={v => update('proof', v)}
                      style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.65, color: '#011836', display: 'block' }} placeholder={'"Quote" — Name'} />
                  </div>

                  <EditableBlock value={ec.speed} fieldKey="speed" onSave={v => update('speed', v)}
                    style={{ fontSize: 15, lineHeight: 1.75, color: '#1a2540', marginBottom: 18, display: 'block' }} placeholder="Speed paragraph…" />

                  <EditableBlock value={ec.ease} fieldKey="ease" onSave={v => update('ease', v)}
                    style={{ fontSize: 15, lineHeight: 1.75, color: '#3a4a6a', marginBottom: 22, display: 'block' }} placeholder="Ease paragraph…" />

                  <div style={{ background: '#011836', borderRadius: 10, padding: '16px 22px', marginBottom: 22, textAlign: 'center' }}>
                    <EditableBlock value={ec.cta} fieldKey="cta" onSave={v => update('cta', v)}
                      style={{ color: '#C9A84C', fontWeight: 700, fontSize: 15, display: 'block' }} placeholder="Call to action…" />
                  </div>

                  <EditableBlock value={ec.closing} fieldKey="closing" onSave={v => update('closing', v)}
                    style={{ fontSize: 14, lineHeight: 1.7, color: '#3a4a6a', display: 'block', whiteSpace: 'pre-line' }} placeholder="Warm sign-off…" />

                  {(ec.ps || ec.ps === '') && (
                    <>
                      <div style={{ height: 1, background: '#e8e4da', margin: '18px 0 14px' }} />
                      <EditableBlock value={ec.ps ?? ''} fieldKey="ps" onSave={v => update('ps', v)}
                        style={{ fontSize: 13, lineHeight: 1.6, color: '#6b7a99', fontStyle: 'italic', display: 'block' }} placeholder="Optional P.S. line…" />
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ background: '#011836', padding: '14px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(201,168,76,.55)', letterSpacing: '.06em' }}>
                Foothill Wellness · 1414 S Foothill Dr, Salt Lake City, UT 84108
              </div>
            </div>
          </div>

          {/* Helper tip */}
          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11.5, color: 'var(--muted)' }}>
            Click any section above to edit it directly
          </div>
        </div>
      </div>

      {/* ── RIGHT: Reviews + AI tabs ── */}
      <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid var(--line)', overflow: 'hidden' }}>

        {/* Tab bar + Copy button */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--line)', padding: '0 16px', gap: 0, flexShrink: 0 }}>
          <div style={{ display: 'flex', flex: 1 }}>
            {(['ai', 'reviews'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '13px 16px', fontSize: 12.5, fontWeight: tab === t ? 700 : 500,
                color: tab === t ? 'var(--navy-mid)' : 'var(--muted)',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
                letterSpacing: '.02em', transition: '.12s',
              }}>
                {t === 'ai' ? '✦ AI Refine' : '★ Reviews'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => { navigator.clipboard?.writeText(assembleFullEmail(ec)); onToast('Email copied!'); }}
              style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy-mid)', background: 'var(--cream)', border: '1.5px solid var(--line)', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', flexShrink: 0 }}
            >
              Copy
            </button>
            <button
              onClick={sendToGHL}
              disabled={ghlSending || isLoading}
              title="Create template in Go High Level"
              style={{
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                color: ghlSending || isLoading ? 'var(--muted)' : '#fff',
                background: ghlSending || isLoading ? 'var(--line-soft)' : 'var(--navy-deep)',
                border: 'none', borderRadius: 7, padding: '6px 10px',
                cursor: ghlSending || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {ghlSending
                ? <><div className="spin" style={{ width: 12, height: 12, borderWidth: 2 }} /> Sending…</>
                : '↑ Send to GHL'}
            </button>
          </div>
        </div>

        {/* AI TAB */}
        {tab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="scrolly" ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiHistory.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-mid)', marginBottom: 6 }}>AI Email Refiner</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>Tell the AI how to update this email and it will rewrite every section for you.</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, justifyContent: 'center' }}>
                    {['Make it shorter', 'More emotional', 'Punchier subject line', 'Focus on speed of results', 'Make the CTA softer'].map(s => (
                      <button key={s} onClick={() => { setAiDraft(s); }}
                        style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy-mid)', background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {aiHistory.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center', background: m.role === 'ai' ? 'var(--navy-deep)' : 'var(--beige)', color: m.role === 'ai' ? 'var(--gold-cta)' : 'var(--navy-mid)', fontSize: 9, fontWeight: 700 }}>
                    {m.role === 'ai' ? '✦' : 'You'}
                  </div>
                  <div style={{ background: m.role === 'ai' ? 'var(--cream)' : 'var(--navy-deep)', color: m.role === 'ai' ? 'var(--text)' : '#fff', padding: '9px 12px', borderRadius: 10, fontSize: 12.5, lineHeight: 1.5, maxWidth: 240, borderTopLeftRadius: m.role === 'ai' ? 3 : 10, borderTopRightRadius: m.role === 'user' ? 3 : 10 }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--navy-deep)', color: 'var(--gold-cta)', display: 'grid', placeItems: 'center', fontSize: 9 }}>✦</div>
                  <div style={{ background: 'var(--cream)', padding: '10px 14px', borderRadius: 10, borderTopLeftRadius: 3, display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', opacity: .6, animation: `pulse 1.2s ${i * .2}s infinite` }} />)}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea
                  value={aiDraft}
                  onChange={e => setAiDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAI(); } }}
                  placeholder="e.g. Make it shorter, focus on speed of results, change the tone to be warmer…"
                  rows={3}
                  style={{ flex: 1, resize: 'none', fontSize: 12.5, padding: '9px 11px', borderRadius: 9, border: '1.5px solid var(--line)', background: 'var(--cream)', color: 'var(--navy-mid)', fontFamily: 'inherit', lineHeight: 1.45, outline: 'none' }}
                />
                <button
                  onClick={sendAI}
                  disabled={!aiDraft.trim() || aiLoading}
                  style={{ width: 40, borderRadius: 9, border: 'none', background: !aiDraft.trim() || aiLoading ? 'var(--line-soft)' : 'var(--navy-deep)', color: !aiDraft.trim() || aiLoading ? 'var(--muted)' : 'var(--gold-cta)', cursor: !aiDraft.trim() || aiLoading ? 'not-allowed' : 'pointer', fontSize: 16, display: 'grid', placeItems: 'center', flexShrink: 0 }}
                >
                  ↑
                </button>
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 6 }}>Enter to send · Shift+Enter for new line</div>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && (
          <div className="scrolly" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Click a review to use it as the proof section in your email.
            </div>
            {reviews.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '30px 0' }}>
                No reviews found for {current.service}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((r, i) => {
                const isActive = ec.proof.includes(r.name);
                return (
                  <button
                    key={i}
                    onClick={() => selectReview(r)}
                    style={{
                      textAlign: 'left', padding: '12px 14px', borderRadius: 10,
                      background: isActive ? 'var(--navy-deep)' : 'var(--cream)',
                      border: `1.5px solid ${isActive ? 'var(--navy-deep)' : 'var(--line)'}`,
                      cursor: 'pointer', transition: '.13s',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? 'var(--gold-cta)' : 'var(--gold-muted)', marginBottom: 5 }}>
                      {isActive ? '✓ ' : ''}{r.name} {'★'.repeat(r.rating)}
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.55, color: isActive ? 'rgba(255,255,255,.85)' : 'var(--navy-mid)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{r.text}"
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
