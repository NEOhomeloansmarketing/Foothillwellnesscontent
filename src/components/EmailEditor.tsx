'use client';
import { useRef } from 'react';
import type { ContentPiece, EmailContent } from '@/types';

interface EmailEditorProps {
  current: ContentPiece;
  onUpdate: (p: ContentPiece) => void;
  onToast: (msg: string) => void;
}

function field(ec: EmailContent, key: keyof EmailContent): string {
  const v = ec[key];
  return typeof v === 'string' ? v : '';
}

function assembleFullEmail(ec: EmailContent): string {
  const lines: string[] = [
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

export default function EmailEditor({ current, onUpdate, onToast }: EmailEditorProps) {
  const ec = current.emailContent ?? {
    subject: '',
    previewText: '',
    opening: '',
    empathy: '',
    explanation: '',
    proof: '',
    speed: '',
    ease: '',
    cta: 'Call or text (801) 784-0095',
    closing: 'Foothill Wellness Team',
  } as EmailContent;

  const isLoading = ec.subject === 'Writing your email…';

  function update(key: keyof EmailContent, value: string) {
    onUpdate({ ...current, emailContent: { ...ec, [key]: value } });
  }

  function copyEmail() {
    navigator.clipboard?.writeText(assembleFullEmail(ec));
    onToast('Email copied to clipboard!');
  }

  const FIELDS: { key: keyof EmailContent; label: string; rows: number; hint: string }[] = [
    { key: 'subject', label: 'Subject Line', rows: 1, hint: 'Problem-aware or outcome-focused (under 60 chars)' },
    { key: 'previewText', label: 'Preview Text', rows: 1, hint: 'Adds curiosity or emotional relevance (under 90 chars)' },
    { key: 'opening', label: 'Opening', rows: 3, hint: '1-2 sentences — lead with the reader\'s problem or desire' },
    { key: 'empathy', label: 'Empathy', rows: 3, hint: '1-2 sentences — make them feel seen and understood' },
    { key: 'explanation', label: 'Explanation', rows: 4, hint: '2-3 sentences — explain the service with a believable mechanism' },
    { key: 'proof', label: 'Proof / Testimonial', rows: 3, hint: 'Formatted as: "quote" — Name' },
    { key: 'speed', label: 'Speed', rows: 2, hint: '1-2 sentences — make the outcome feel closer/sooner' },
    { key: 'ease', label: 'Ease', rows: 2, hint: '1-2 sentences — make the first step feel effortless' },
    { key: 'cta', label: 'Call to Action', rows: 2, hint: 'Direct invite to call or text' },
    { key: 'closing', label: 'Closing', rows: 2, hint: 'Warm sign-off ending with: Foothill Wellness Team' },
    { key: 'ps', label: 'P.S. (optional)', rows: 2, hint: 'Optional urgency or bonus detail' },
  ];

  // Refs for uncontrolled textareas to avoid cursor-jump
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement | null>>(new Map());

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
      {/* LEFT: Email Preview */}
      <div
        className="scrolly"
        style={{
          flex: '1 1 55%',
          overflowY: 'auto',
          background: '#F0EDE6',
          padding: '32px 24px',
          borderRight: '1px solid var(--line)',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* Email client chrome */}
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, display: 'flex', gap: 16 }}>
            <span><b style={{ color: 'var(--navy-mid)' }}>Subject:</b> {ec.subject || <em>—</em>}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 24 }}>
            <span><b style={{ color: 'var(--navy-mid)' }}>Preview:</b> {ec.previewText || <em>—</em>}</span>
          </div>

          {/* Email body card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 4px 32px rgba(1,24,54,.10)',
          }}>
            {/* Navy header */}
            <div style={{
              background: '#011836',
              padding: '28px 40px',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                fontWeight: 800,
                color: '#C9A84C',
                letterSpacing: '.04em',
              }}>
                Foothill Wellness
              </div>
              <div style={{ fontSize: 12, color: 'rgba(201,168,76,.65)', marginTop: 4, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                Feel Better Faster
              </div>
            </div>

            {/* Body content */}
            <div style={{ padding: '36px 40px 28px', lineHeight: 1.75, color: '#1a2540' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--line)', borderTopColor: 'var(--gold)', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Writing your email with AI…</div>
                </div>
              ) : (
                <>
                  {ec.opening && (
                    <p style={{ fontSize: 15, color: '#1a2540', marginBottom: 18 }}>{ec.opening}</p>
                  )}

                  {ec.empathy && (
                    <p style={{ fontSize: 15, color: '#3a4a6a', marginBottom: 18 }}>{ec.empathy}</p>
                  )}

                  {ec.explanation && (
                    <div style={{
                      background: '#FAF8F3',
                      borderLeft: '3px solid #C9A84C',
                      borderRadius: '0 8px 8px 0',
                      padding: '16px 20px',
                      marginBottom: 20,
                    }}>
                      <p style={{ fontSize: 14.5, color: '#1a2540', margin: 0 }}>{ec.explanation}</p>
                    </div>
                  )}

                  {ec.proof && (
                    <div style={{
                      background: '#FAF8F3',
                      borderRadius: 10,
                      padding: '18px 22px',
                      marginBottom: 20,
                      borderTop: '2px solid #C9A84C',
                    }}>
                      <p style={{
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: 'italic',
                        fontSize: 15,
                        color: '#011836',
                        margin: 0,
                        lineHeight: 1.65,
                      }}>{ec.proof}</p>
                    </div>
                  )}

                  {ec.speed && (
                    <p style={{ fontSize: 15, color: '#1a2540', marginBottom: 18 }}>{ec.speed}</p>
                  )}

                  {ec.ease && (
                    <p style={{ fontSize: 15, color: '#3a4a6a', marginBottom: 22 }}>{ec.ease}</p>
                  )}

                  {ec.cta && (
                    <div style={{
                      background: '#011836',
                      borderRadius: 10,
                      padding: '18px 24px',
                      marginBottom: 24,
                      textAlign: 'center',
                    }}>
                      <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: 15, margin: 0 }}>{ec.cta}</p>
                    </div>
                  )}

                  {ec.closing && (
                    <p style={{ fontSize: 14, color: '#3a4a6a', marginBottom: ec.ps ? 12 : 0, whiteSpace: 'pre-line' }}>{ec.closing}</p>
                  )}

                  {ec.ps && (
                    <p style={{ fontSize: 13, color: '#6b7a99', marginTop: 16, fontStyle: 'italic', borderTop: '1px solid #e8e4da', paddingTop: 14 }}>
                      P.S. {ec.ps}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{
              background: '#011836',
              padding: '16px 40px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(201,168,76,.6)', letterSpacing: '.06em' }}>
                Foothill Wellness · 1414 S Foothill Dr, Salt Lake City, UT 84108
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Editing Panel */}
      <div
        className="scrolly"
        style={{
          flex: '0 0 380px',
          overflowY: 'auto',
          background: '#fff',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Panel header */}
        <div style={{
          padding: '16px 20px 14px',
          borderBottom: '1px solid var(--line)',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy-mid)', letterSpacing: '.02em' }}>Email Fields</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{current.service} · {current.goal}</div>
          </div>
          <button
            onClick={copyEmail}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 700,
              background: 'var(--navy-deep)', color: 'var(--gold-cta)',
              border: 'none', borderRadius: 9, padding: '8px 14px',
              cursor: 'pointer', letterSpacing: '.03em',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Full Email
          </button>
        </div>

        {/* Fields */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FIELDS.map(({ key, label, rows, hint }) => (
            <div key={key}>
              <div className="rp-label" style={{ marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 10.5, color: 'var(--muted)', marginBottom: 6, lineHeight: 1.4 }}>{hint}</div>
              {rows === 1 ? (
                <input
                  type="text"
                  defaultValue={field(ec, key)}
                  key={`${current.id}-${key}`}
                  onBlur={e => update(key, e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: 12.5,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1.5px solid var(--line)',
                    background: 'var(--cream)',
                    color: 'var(--navy-mid)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <textarea
                  ref={el => { textareaRefs.current.set(key, el); }}
                  rows={rows}
                  defaultValue={field(ec, key)}
                  key={`${current.id}-${key}`}
                  onBlur={e => update(key, e.target.value)}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    fontSize: 12.5,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1.5px solid var(--line)',
                    background: 'var(--cream)',
                    color: 'var(--navy-mid)',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
