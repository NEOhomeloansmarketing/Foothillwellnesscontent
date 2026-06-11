'use client';
import Icon from './ui/Icon';
import Social from './ui/Social';
import Btn from './ui/Btn';
import Peaks from './ui/Peaks';
import GraphicCanvas from './graphic/GraphicCanvas';
import { contentTypes } from '@/lib/brand';
import type { ContentPiece } from '@/types';

function fmtDate(ts: number) {
  const d = new Date(ts), now = new Date();
  const diff = (now.getTime() - d.getTime()) / 86400000;
  if (diff < 1 && now.getDate() === d.getDate()) return 'Today';
  if (diff < 2) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const iconFor: Record<string, string> = {
  'ig-post':'image','ig-carousel':'carousel','ig-story':'story','reel':'video',
  'flyer':'flyer','handout':'handout','email':'email','sms':'sms','blog':'blog','ad':'ad',
};
const groups = ['Social Graphics','Video','Print','Direct','Long-form'];

interface HomeProps {
  projects: ContentPiece[];
  onPick: (type: string) => void;
  onOpen: (p: ContentPiece) => void;
}

export default function Home({ projects, onPick, onOpen }: HomeProps) {
  const recents = projects.slice(0, 4);
  const posted = projects.filter(p => p.status === 'posted').length;
  const scheduled = projects.filter(p => p.status === 'scheduled').length;

  return (
    <div className="home scrolly" style={{ overflowY: 'auto' }}>
      <div className="hero">
        <div className="peaks"><Peaks color="#C9A84C" w={620} /></div>
        <div className="wrap">
          <div className="eyebrow">Foothill Wellness · Content Studio</div>
          <h1 className="serif">What are we creating <em>today</em>?</h1>
          <p className="sub">Every piece runs through your brand guide, the Rosetta Stone, and the Five Laws of Marketing — automatically. Pick a format to begin.</p>
          <div style={{ display: 'flex', gap: 11, marginTop: 26 }}>
            <Btn variant="gold" size="lg" icon="wand" onClick={() => onPick('ig-post')}>New content</Btn>
            <Btn variant="ghost" size="lg" icon="clock" onClick={() => onPick('library')}
              style={{ background: 'rgba(255,255,255,.08)', color: '#fff', borderColor: 'rgba(255,255,255,.18)' }}>Open library</Btn>
          </div>
        </div>
      </div>

      <div className="home-body">
        <div className="section-head">
          <div>
            <div className="eyebrow">Start something</div>
            <h2 className="serif">Choose a format</h2>
          </div>
          <p>All formats are brand-locked &amp; Five-Laws filtered</p>
        </div>

        {groups.map(g => {
          const list = contentTypes.filter(t => t.group === g);
          if (!list.length) return null;
          return (
            <div key={g} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 12px' }}>
                <span className="eyebrow" style={{ color: 'var(--navy-mid)' }}>{g}</span>
                <span className="gold-rule" style={{ flex: 'none' }} />
              </div>
              <div className="type-grid">
                {list.map(t => (
                  <button key={t.id} className={`type-card ${t.id === 'ig-post' ? 'feat' : ''}`} onClick={() => onPick(t.id)}>
                    <span className="grp">{(t.id === 'ig-post' || t.id === 'email' || t.id === 'flyer') ? 'Ready' : 'Soon'}</span>
                    <div className="ic"><Icon n={iconFor[t.id] || 'grid'} size={22} /></div>
                    <h3>{t.label}</h3>
                    <div className="desc">{t.desc}</div>
                    <div className="meta">
                      <span className="ratio">{t.ratio}</span>
                      <span style={{ color: 'var(--gold)' }}><Icon n="arrowUp" size={15} style={{ transform: 'rotate(45deg)' }} /></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div className="recents">
          <div className="section-head">
            <div>
              <div className="eyebrow">Pick up where you left off</div>
              <h2 className="serif">Recent projects</h2>
            </div>
            <div style={{ display: 'flex', gap: 18, fontSize: 12.5, color: 'var(--muted)' }}>
              <span><b style={{ color: 'var(--navy-mid)' }}>{posted}</b> posted</span>
              <span><b style={{ color: 'var(--navy-mid)' }}>{scheduled}</b> scheduled</span>
            </div>
          </div>
          <div className="proj-row">
            {recents.map(p => (
              <button key={p.id} className="proj-card" onClick={() => onOpen(p)}>
                <div className="proj-thumb">
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: 'scale(.2315)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                    <GraphicCanvas tpl={p.template} content={p.graphic} />
                  </div>
                  <span className="tag" style={{
                    position: 'absolute', top: 10, left: 10, zIndex: 2,
                    background: p.status === 'posted' ? '#eef6f0' : p.status === 'scheduled' ? '#fdf3df' : '#fff',
                    color: p.status === 'posted' ? '#3f8a5b' : p.status === 'scheduled' ? '#9a7d2e' : 'var(--muted)',
                  }}>{p.status}</span>
                </div>
                <div className="proj-info">
                  <div className="t">{p.title}</div>
                  <div className="m">
                    <span>{fmtDate(p.createdAt)}</span>
                    {p.channels.length > 0 && (
                      <span style={{ display: 'flex', gap: 4, color: 'var(--gold-muted)' }}>
                        {p.channels.slice(0, 4).map(c => <Social key={c} n={c} size={13} />)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
