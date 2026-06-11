'use client';
import { useState } from 'react';
import { reviewCategories, getReviewsForService } from '@/lib/testimonials';
import type { ContentPiece } from '@/types';

interface Props {
  current: ContentPiece;
  onSelect: (review: { name: string; text: string }) => void;
  onClose: () => void;
}

export default function ReviewPicker({ current, onSelect, onClose }: Props) {
  // Default to the tab that matches the current service
  const matchedCat = reviewCategories.find(c => c.services.includes(current.service));
  const [activeTab, setActiveTab] = useState(matchedCat?.key ?? 'generic');
  const [search, setSearch] = useState('');

  const tab = reviewCategories.find(c => c.key === activeTab)!;
  const filtered = tab.reviews.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(1,24,54,0.72)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 760, maxHeight: '88vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(1,24,54,0.25)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '22px 28px 0', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: 'var(--navy-deep)' }}>
                Replace Review
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                Select a real client review to use in your post
              </div>
            </div>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--muted)', lineHeight: 1 }}>×</button>
          </div>

          {/* Service tabs */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }}>
            {reviewCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                style={{
                  border: 'none', cursor: 'pointer', padding: '8px 14px',
                  borderRadius: '8px 8px 0 0', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  background: activeTab === cat.key ? 'var(--navy-deep)' : 'transparent',
                  color: activeTab === cat.key ? '#fff' : 'var(--muted)',
                  borderBottom: activeTab === cat.key ? '2px solid var(--navy-deep)' : '2px solid transparent',
                  transition: '.15s',
                }}
              >
                {cat.label}
                <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.7 }}>({cat.reviews.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 28px', borderBottom: '1px solid var(--line-soft)' }}>
          <input
            type="text"
            placeholder="Search reviews…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', border: '1.5px solid var(--line)', borderRadius: 10,
              padding: '9px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Review list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 20px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>
              No reviews match your search
            </div>
          )}
          {filtered.map((r, i) => (
            <button
              key={i}
              onClick={() => { onSelect(r); onClose(); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                border: current.proofUsed === r.name ? '2px solid var(--navy-deep)' : '1.5px solid var(--line)',
                borderRadius: 12, padding: '14px 16px', marginBottom: 8,
                background: current.proofUsed === r.name ? 'rgba(1,24,54,0.04)' : '#fff',
                cursor: 'pointer', transition: '.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = current.proofUsed === r.name ? 'var(--navy-deep)' : 'var(--line)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy-deep)' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#C9A84C' }}>{'★'.repeat(r.rating)}</div>
                {current.proofUsed === r.name && (
                  <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: 'var(--navy-deep)', background: 'rgba(1,24,54,0.08)', borderRadius: 4, padding: '2px 6px' }}>
                    CURRENT
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#4a556a', lineHeight: 1.55 }}>
                {r.text.length > 220 ? r.text.slice(0, 218) + '…' : r.text}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
