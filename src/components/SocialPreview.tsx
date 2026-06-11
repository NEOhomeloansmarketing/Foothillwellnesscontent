'use client';
import { useState } from 'react';
import Icon from './ui/Icon';

interface Props {
  imageUrl: string;
  caption: string;
  hashtags: string[];
  service: string;
  webhookUrl: string;
  onPosted: () => void;
  onClose: () => void;
}

function formatCaption(raw: string): string {
  return raw
    .split('\n')
    .map(l => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function SocialPreview({ imageUrl, caption, hashtags, service, webhookUrl, onPosted, onClose }: Props) {
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanCaption = formatCaption(caption);
  const hashtagLine = hashtags.join(' ');
  const fullCaption = cleanCaption + (hashtagLine ? '\n\n' + hashtagLine : '');

  async function handlePost() {
    setPosting(true);
    setError(null);
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          payload: {
            imageUrl,
            caption: fullCaption,
            hashtags: hashtagLine,
            fullCaption,
            service,
            platform: 'instagram',
            timestamp: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || `Zapier returned ${data.status}: ${data.body}`);

      // Parent closes modal, shows toast, saves project, and navigates
      onPosted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send — check your Zapier webhook');
      setPosting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(1,24,54,0.8)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 860,
          maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 32px 100px rgba(1,24,54,0.35)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: 'var(--navy-deep)' }}>
              Social Preview
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              Review your post before sending to Instagram
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--muted)', lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: '#fef2f2', borderBottom: '2px solid #fca5a5', padding: '14px 28px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ color: '#dc2626', fontSize: 16, fontWeight: 900, lineHeight: 1 }}>!</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Post failed — Zapier didn't receive it</div>
              <div style={{ fontSize: 12, color: '#b91c1c', lineHeight: 1.5 }}>{error}</div>
              <div style={{ fontSize: 11.5, color: '#b91c1c', marginTop: 4, opacity: 0.8 }}>Check the webhook URL under "Socials connected" and try again.</div>
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* Image */}
          <div style={{ padding: 28, background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
              Instagram Post
            </div>
            <div style={{ width: '100%', maxWidth: 340, aspectRatio: '1', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(1,24,54,0.15)', background: '#1a2a40' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Post preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#43a06a' }} />
              Image uploaded &amp; ready
            </div>
          </div>

          {/* Caption */}
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16, borderLeft: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Caption</div>
              <div style={{ fontSize: 13.5, color: 'var(--navy-mid)', lineHeight: 1.65, whiteSpace: 'pre-wrap', background: 'var(--cream)', borderRadius: 10, padding: '14px 16px', maxHeight: 220, overflowY: 'auto' }}>
                {fullCaption}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '18px 28px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button
            onClick={onClose}
            style={{ border: '1.5px solid var(--line)', background: '#fff', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 600, color: 'var(--navy-mid)', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={posting}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: posting ? 'var(--line-soft)' : 'var(--navy-deep)',
              color: posting ? 'var(--muted)' : 'var(--gold-cta)',
              border: 'none', borderRadius: 12, padding: '13px 32px',
              fontSize: 14, fontWeight: 800, cursor: posting ? 'not-allowed' : 'pointer',
              letterSpacing: '.03em', transition: '.15s',
            }}
          >
            <Icon n={posting ? 'refresh' : 'send'} size={16} />
            {posting ? 'Sending to Instagram…' : 'Post Now →'}
          </button>
        </div>
      </div>
    </div>
  );
}
