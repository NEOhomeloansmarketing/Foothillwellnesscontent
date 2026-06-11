'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from './ui/Icon';
import Social from './ui/Social';
import Btn from './ui/Btn';
import GraphicCanvas, { TEMPLATES } from './graphic/GraphicCanvas';
import { AUD } from '@/lib/content';
import { useStore } from '@/store';
import type { ContentPiece, ChannelId, ChatMessage, FiveLaw, TextOverlay } from '@/types';
import type { Webhooks } from '@/store';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(ts: number) {
  const d = new Date(ts), now = new Date();
  const diff = (now.getTime() - d.getTime()) / 86400000;
  if (diff < 1 && now.getDate() === d.getDate()) return 'Today';
  if (diff < 2) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const CHANNELS: [ChannelId, string][] = [
  ['instagram', 'Instagram'], ['google', 'Google Business'],
];

const GEN_STEPS = [
  'Activating Rosetta Stone & brand voice…',
  'Leading with the client\'s problem…',
  'Matching a real client testimonial…',
  'Building hook, caption & graphic…',
  'Generating your AI image…',
  'Scoring against all Five Laws…',
];

// ─── Generation overlay ────────────────────────────────────────────────────────
function GenOverlay() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => Math.min(v + 1, GEN_STEPS.length - 1)), 850);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'radial-gradient(ellipse at 50% 40%, rgba(24,41,67,.97), rgba(1,24,54,.99))',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(209,187,116,.25)', borderTopColor: '#D1BB74', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: '#fff', fontWeight: 700, marginBottom: 8 }}>
          Creating your content
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Powered by Claude + DALL·E 3</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
        {GEN_STEPS.map((s, k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: k <= i ? 1 : .3, transition: '.4s' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flex: 'none',
              background: k < i ? '#43a06a' : k === i ? 'rgba(209,187,116,.2)' : 'rgba(255,255,255,.08)',
              border: `1.5px solid ${k < i ? '#43a06a' : k === i ? '#D1BB74' : 'rgba(255,255,255,.15)'}`,
              display: 'grid', placeItems: 'center',
            }}>
              {k < i && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12l5 5 9-11" /></svg>}
              {k === i && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1BB74' }} />}
            </div>
            <span style={{ fontSize: 13, color: k <= i ? '#fff' : 'rgba(255,255,255,.4)', fontWeight: k === i ? 600 : 400 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Five Laws scorecard ────────────────────────────────────────────────────────
function FiveLawsCard({ laws }: { laws: FiveLaw[] }) {
  const avg = (laws.reduce((a, b) => a + b.score, 0) / laws.length).toFixed(1);
  const scoreColor = +avg >= 4.5 ? '#43a06a' : +avg >= 3.5 ? '#D1BB74' : '#ef4444';
  return (
    <div className="prop-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)' }}>Five Laws Score</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
          {avg}<span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--body)' }}>/5</span>
        </div>
      </div>
      {laws.map((l, i) => (
        <div key={i} style={{ padding: '8px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy-mid)' }}>{l.law}</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(n => <div key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: n <= l.score ? 'var(--gold)' : 'var(--line)' }} />)}
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{l.note}</div>
        </div>
      ))}
    </div>
  );
}

// ─── AI typing dots ─────────────────────────────────────────────────────────────
function Dot({ d = 0 }: { d?: number }) {
  return <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold-muted)', animation: `blink 1s ${d}s infinite`, display: 'inline-block' }} />;
}

// ─── AI Image Generation Panel ─────────────────────────────────────────────────
function AIImagePanel({ service, audience, onGenerated, onClose }: {
  service: string; audience: string; onGenerated: (url: string) => void; onClose: () => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const suggestions = [
    'Person looking relaxed and relieved', 'Clean modern spa interior', 'Glowing healthy skin',
    'Confident person in activewear', 'Serene treatment room with warm light',
  ];

  async function generate() {
    setLoading(true); setError(''); setPreview('');
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, service, audience }),
      });
      const json = await res.json();
      if (json.ok) setPreview(json.dataUrl);
      else setError(json.error || 'Image generation failed — try again.');
    } catch { setError('Network error — please try again.'); }
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(1,24,54,.65)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 540, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.35)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#011836,#0F1F3D)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(209,187,116,.15)', border: '1px solid rgba(209,187,116,.3)', display: 'grid', placeItems: 'center', color: '#D1BB74' }}>
              <Icon n="sparkle" size={20} />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>AI Image Studio</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>DALL·E 3 · Wellness-tuned · 1024×1024</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.1)', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon n="x" size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 8 }}>
            Describe the image (optional — leave blank for auto)
          </div>
          <textarea
            rows={3}
            placeholder={`Auto-generating for: ${service}. Or add direction like "close-up of glowing skin, warm light, clean white background..."`}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            style={{ width: '100%', resize: 'none', border: '1.5px solid var(--line)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, lineHeight: 1.5, outline: 'none', fontFamily: 'var(--body)', color: 'var(--text)' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => setPrompt(s)} style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--navy-mid)', background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 999, padding: '5px 11px', cursor: 'pointer' }}>{s}</button>
            ))}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <Btn variant="gold" icon="sparkle" onClick={generate} style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: '12px 20px' }}>
              {loading ? 'Generating…' : 'Generate with DALL·E 3'}
            </Btn>
            {preview && <Btn variant="navy" icon="check" onClick={() => { onGenerated(preview); onClose(); }}>Use This</Btn>}
          </div>

          {loading && (
            <div style={{ marginTop: 20, textAlign: 'center', padding: '28px 0', borderTop: '1px solid var(--line-soft)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--line)', borderTopColor: 'var(--gold)', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 13, color: 'var(--navy-mid)', fontWeight: 600 }}>Generating a {service} image…</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>DALL·E 3 takes 15–30 seconds</div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>⚠ {error}</div>
            </div>
          )}

          {preview && !loading && (
            <div style={{ marginTop: 16, borderTop: '1px solid var(--line-soft)', paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 10 }}>Preview</div>
              <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1', background: 'var(--navy-deep)', cursor: 'pointer', position: 'relative' }} onClick={() => { onGenerated(preview); onClose(); }}>
                <img src={preview} alt="AI Generated" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(1,24,54,.8))', display: 'flex', alignItems: 'flex-end', padding: 14 }}>
                  <div style={{ width: '100%', background: '#D1BB74', color: '#011836', borderRadius: 9, padding: '11px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                    ✓ Click to Use This Image
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Left panel: library + templates ───────────────────────────────────────────
function LeftPanel({ projects, current, onSelect, onPick }: {
  projects: ContentPiece[]; current: ContentPiece | null;
  onSelect: (p: ContentPiece) => void; onPick: (t: string) => void;
}) {
  const removeProject = useStore(s => s.removeProject);
  const addProject = useStore(s => s.addProject);
  const [q, setQ] = useState('');

  const list = q ? projects.filter(p => (p.title + p.service).toLowerCase().includes(q.toLowerCase())) : projects;
  const groups: Record<string, ContentPiece[]> = {};
  list.forEach(p => { const k = fmtDate(p.createdAt); (groups[k] = groups[k] || []).push(p); });

  function handleDelete(p: ContentPiece, e: React.MouseEvent) {
    e.stopPropagation();
    removeProject(p.id);
    const el = document.createElement('div');
    el.className = 'undo-toast';
    el.innerHTML = `Deleted &ldquo;${p.title}&rdquo; <button>Undo</button>`;
    document.body.appendChild(el);
    const timer = setTimeout(() => el.remove(), 4500);
    el.querySelector('button')!.onclick = () => { clearTimeout(timer); addProject({ ...p }); el.remove(); };
  }

  return (
    <div className="ed-left">
      <div className="ed-left-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold-muted)' }}>Library</div>
          <button className="ed-new-btn" onClick={() => onPick('ig-post')}><Icon n="plus" size={13} /> New</button>
        </div>
        <div className="ed-search"><Icon n="search" size={13} /><input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} /></div>
      </div>

      <div className="ed-proj-list scrolly">
        {Object.keys(groups).length === 0 && (
          <div style={{ padding: '28px 14px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
            No content yet.<br />Click <b>New</b> above.
          </div>
        )}
        {Object.keys(groups).map(day => (
          <div key={day}>
            <div className="ed-day">{day}</div>
            {groups[day].map(p => (
              <div key={p.id} className={`ed-proj ${current?.id === p.id ? 'on' : ''}`}>
                <button className="ed-proj-btn" onClick={() => onSelect(p)}>
                  <div className="ed-proj-thumb">
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: 'scale(.0389)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                      <GraphicCanvas tpl={p.template} content={p.graphic} img={p.autoImage} />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div className="ed-proj-title">{p.title}</div>
                    <div className="ed-proj-meta">
                      <span className={`status-dot ${p.status}`} />
                      {p.status}
                    </div>
                  </div>
                </button>
                <button className="ed-del-btn" onClick={e => handleDelete(p, e)} title="Delete"><Icon n="trash" size={12} /></button>
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── Main canvas area ───────────────────────────────────────────────────────────
interface CanvasProps {
  current: ContentPiece;
  img: string | string[] | null;
  imgPos: { x: number; y: number };
  onImgPos: (pos: { x: number; y: number }) => void;
  onEditField: (field: string, val: string) => void;
  onUpdate: (p: ContentPiece) => void;
  onExport: () => void;
  onToast: (msg: string) => void;
  onSave: (p: ContentPiece) => void;
  getExportDataUrl: () => Promise<string | null>;
}

function CanvasPanel({ current, img, imgPos, onImgPos, onEditField, onUpdate, onExport, onToast, onSave, getExportDataUrl }: CanvasProps) {
  const [showCaption, setShowCaption] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState(460);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const overlayDragStart = useRef<{ x: number; y: number; ox: number; oy: number; id: string } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const hasImg = !!img;
  const overlays: TextOverlay[] = current.textOverlays || [];

  // Responsive canvas size
  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const size = Math.min(Math.floor(Math.min(width - 40, height - 56)), 500);
      setCanvasSize(Math.max(size, 280));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Image drag
  function onMouseDown(e: React.MouseEvent) {
    if (overlayDragStart.current) return;
    if (!hasImg) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: imgPos.x, py: imgPos.y };
    e.preventDefault();
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (overlayDragStart.current) {
      const od = overlayDragStart.current;
      const scale = canvasSize / 1080;
      const dx = (e.clientX - od.x) / scale;
      const dy = (e.clientY - od.y) / scale;
      const nx = Math.max(0, Math.min(1080, od.ox + dx));
      const ny = Math.max(0, Math.min(1080, od.oy + dy));
      onUpdate({ ...current, textOverlays: overlays.map(o => o.id === od.id ? { ...o, x: Math.round(nx), y: Math.round(ny) } : o) });
      return;
    }
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const sensitivity = 80 / canvasSize;
    const nx = Math.max(0, Math.min(100, dragStart.current.px + dx * sensitivity));
    const ny = Math.max(0, Math.min(100, dragStart.current.py + dy * sensitivity));
    onImgPos({ x: Math.round(nx), y: Math.round(ny) });
  }, [isDragging, canvasSize, onImgPos, overlays, current, onUpdate]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
    overlayDragStart.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  function addTextBox() {
    const newOverlay: TextOverlay = {
      id: 'txt' + Math.random().toString(36).slice(2, 7),
      text: 'Add your text here',
      x: 540, y: 540,
      fontSize: 48,
      color: '#ffffff',
      bold: true,
      italic: false,
      fontFamily: 'sans',
    };
    onUpdate({ ...current, textOverlays: [...overlays, newOverlay] });
    setSelectedOverlay(newOverlay.id);
  }

  function updateOverlay(id: string, patch: Partial<TextOverlay>) {
    onUpdate({ ...current, textOverlays: overlays.map(o => o.id === id ? { ...o, ...patch } : o) });
  }

  function deleteOverlay(id: string) {
    onUpdate({ ...current, textOverlays: overlays.filter(o => o.id !== id) });
    setSelectedOverlay(null);
  }

  const g = current.graphic;
  const scale = canvasSize / 1080;
  const sel = overlays.find(o => o.id === selectedOverlay);

  return (
    <div className="ed-center" onClick={() => setSelectedOverlay(null)}>
      {/* Top info bar */}
      <div className="ed-center-bar">
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: 'var(--navy-mid)' }}>{current.service}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{AUD[current.audience]} · {current.goal} · Instagram Post</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={addTextBox} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--gold-muted)', background: 'var(--cream)', border: '1.5px solid var(--gold)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
            <Icon n="plus" size={13} /> Add Text
          </button>
          <Btn variant="navy" icon="download" onClick={onExport}>Export PNG</Btn>
        </div>
      </div>

      {/* Canvas area — flex:1, measures itself */}
      <div ref={canvasAreaRef} className="ed-canvas-area">
        <div
          ref={frameRef}
          className="ed-canvas-frame"
          style={{ width: canvasSize, height: canvasSize, cursor: hasImg && !selectedOverlay ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          onMouseDown={onMouseDown}
          onClick={e => e.stopPropagation()}
        >
          {/* Graphic */}
          <div style={{ width: 1080, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
            <GraphicCanvas tpl={current.template} content={g} img={img} imgPos={imgPos} edit={{ on: true, set: onEditField }} />
          </div>

          {/* Text overlays */}
          {overlays.map(o => (
            <div
              key={o.id}
              onMouseDown={e => {
                e.stopPropagation();
                setSelectedOverlay(o.id);
                overlayDragStart.current = { x: e.clientX, y: e.clientY, ox: o.x, oy: o.y, id: o.id };
              }}
              style={{
                position: 'absolute',
                left: o.x * scale,
                top: o.y * scale,
                transform: 'translate(-50%, -50%)',
                cursor: 'move',
                outline: selectedOverlay === o.id ? '2px solid #D1BB74' : '2px dashed rgba(209,187,116,.5)',
                borderRadius: 4,
                padding: '2px 4px',
                zIndex: 10,
              }}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onBlur={e => updateOverlay(o.id, { text: e.currentTarget.innerText.trim() || o.text })}
                onKeyDown={e => { if (e.key === 'Escape') (e.currentTarget as HTMLElement).blur(); }}
                style={{
                  fontSize: o.fontSize * scale,
                  color: o.color,
                  fontFamily: o.fontFamily === 'serif' ? "'Playfair Display',serif" : "'Inter',sans-serif",
                  fontWeight: o.bold ? 700 : 400,
                  fontStyle: o.italic ? 'italic' : 'normal',
                  whiteSpace: 'pre-wrap',
                  minWidth: 80,
                  outline: 'none',
                  textShadow: '0 1px 4px rgba(0,0,0,.5)',
                  cursor: 'text',
                  userSelect: 'text',
                }}
              >{o.text}</div>
            </div>
          ))}

          {/* Drag hint */}
          {hasImg && !isDragging && !selectedOverlay && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(1,24,54,.7)', backdropFilter: 'blur(4px)', borderRadius: 8, padding: '5px 10px', pointerEvents: 'none' }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,.8)' }}>⟡ Drag to reposition photo</span>
            </div>
          )}
        </div>

        {/* Selected overlay toolbar */}
        {sel && (
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(0,0,0,.1)', flexWrap: 'wrap', maxWidth: canvasSize }}>
            <input type="color" value={sel.color} onChange={e => updateOverlay(sel.id, { color: e.target.value })}
              style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0 }} title="Color" />
            <select value={sel.fontSize} onChange={e => updateOverlay(sel.id, { fontSize: +e.target.value })}
              style={{ fontSize: 12, border: '1px solid var(--line)', borderRadius: 6, padding: '3px 6px', color: 'var(--text)' }}>
              {[24,32,40,48,56,64,72,88,96,112].map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
            <select value={sel.fontFamily} onChange={e => updateOverlay(sel.id, { fontFamily: e.target.value as 'serif' | 'sans' })}
              style={{ fontSize: 12, border: '1px solid var(--line)', borderRadius: 6, padding: '3px 6px', color: 'var(--text)' }}>
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
            </select>
            <button onClick={() => updateOverlay(sel.id, { bold: !sel.bold })}
              style={{ fontWeight: 700, fontSize: 13, padding: '3px 8px', borderRadius: 6, border: `1.5px solid ${sel.bold ? 'var(--navy-deep)' : 'var(--line)'}`, background: sel.bold ? 'var(--navy-deep)' : '#fff', color: sel.bold ? '#fff' : 'var(--text)', cursor: 'pointer' }}>B</button>
            <button onClick={() => updateOverlay(sel.id, { italic: !sel.italic })}
              style={{ fontStyle: 'italic', fontSize: 13, padding: '3px 8px', borderRadius: 6, border: `1.5px solid ${sel.italic ? 'var(--navy-deep)' : 'var(--line)'}`, background: sel.italic ? 'var(--navy-deep)' : '#fff', color: sel.italic ? '#fff' : 'var(--text)', cursor: 'pointer' }}>I</button>
            <button onClick={() => deleteOverlay(sel.id)}
              style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', marginLeft: 4 }}>
              <Icon n="trash" size={13} />
            </button>
          </div>
        )}

        {!sel && <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
          <Icon n="edit" size={12} /> <b style={{ color: 'var(--navy-mid)' }}>Click any text</b> to edit · <b style={{ color: 'var(--navy-mid)' }}>Add Text</b> to add a custom box
        </div>}
      </div>

      {/* Template switcher */}
      <div style={{ padding: '10px 16px 0', borderTop: '1px solid var(--line-soft)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 8 }}>Layout</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onUpdate({ ...current, template: t.id })}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 4px', borderRadius: 10, cursor: 'pointer', transition: '.15s', background: current.template === t.id ? 'var(--navy-deep)' : 'var(--cream)', border: current.template === t.id ? '2px solid var(--gold)' : '1.5px solid var(--line)', color: current.template === t.id ? 'var(--gold-cta)' : 'var(--navy-mid)' }}>
              <div style={{ width: 60, height: 60, position: 'relative', borderRadius: 7, overflow: 'hidden', background: 'var(--line-soft)', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: 'scale(.0556)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                  <GraphicCanvas tpl={t.id} content={current.graphic} img={img} />
                </div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textAlign: 'center' }}>{t.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Caption section */}
      <div className="ed-caption-section">
        <button className="ed-caption-toggle" onClick={() => setShowCaption(v => !v)}>
          <span>Caption & Hashtags</span>
          <Icon n={showCaption ? 'chevD' : 'chevR'} size={14} />
          <button className="copy-caption-btn" onClick={e => {
            e.stopPropagation();
            navigator.clipboard?.writeText(current.caption + '\n\n' + current.hashtags.join(' '));
            onToast('Caption copied!');
          }}><Icon n="copy" size={13} /> Copy</button>
        </button>
        {showCaption && (
          <div className="ed-caption-body">
            <div className="ged-caption" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={e => { const t = e.currentTarget.innerText.trim(); if (t) onUpdate({ ...current, caption: t }); }}>
              {current.caption}
            </div>
            <div style={{ marginTop: 10, padding: '10px 0', borderTop: '1px solid var(--line-soft)' }}>
              <span className="hashtag-list ged" contentEditable suppressContentEditableWarning spellCheck={false}
                onBlur={e => { const t = e.currentTarget.innerText.trim(); onUpdate({ ...current, hashtags: t.split(/\s+/).filter(Boolean) }); }}>
                {current.hashtags.join('  ')}
              </span>
            </div>
            <div style={{ marginTop: 12, borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 8 }}>Alternate Hooks (tap to use)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(current.altHooks || []).map((h, i) => (
                  <button key={i} onClick={() => onUpdate({ ...current, graphic: { ...g, hook: h } })}
                    style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 9, background: g.hook === h ? 'var(--navy-deep)' : 'var(--cream)', border: `1.5px solid ${g.hook === h ? 'var(--navy-deep)' : 'var(--line)'}`, fontSize: 13, color: g.hook === h ? '#fff' : 'var(--navy-mid)', fontWeight: 500, cursor: 'pointer', transition: '.13s' }}>
                    {g.hook === h && <span style={{ color: 'var(--gold-cta)', marginRight: 6 }}>✓</span>}{h}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Publish bar */}
      <PublishBar
        current={current}
        onSave={onSave}
        onToast={onToast}
        getExportDataUrl={getExportDataUrl}
      />
    </div>
  );
}

// ─── Publish bar ─────────────────────────────────────────────────────────────
const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/14659614/43606p9/';

function PublishBar({ current, onSave, onToast, getExportDataUrl }: {
  current: ContentPiece;
  onSave: (p: ContentPiece) => void;
  onToast: (msg: string) => void;
  getExportDataUrl: () => Promise<string | null>;
}) {
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    setPosting(true);
    onToast('Exporting image…');
    try {
      const dataUrl = await getExportDataUrl();
      if (!dataUrl) throw new Error('Could not export canvas');

      const payload = {
        service: current.service,
        caption: current.caption,
        hashtags: current.hashtags.join(' '),
        fullCaption: current.caption + '\n\n' + current.hashtags.join(' '),
        imageBase64: dataUrl,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: ZAPIER_WEBHOOK, payload }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || `Zapier returned ${data.status}`);

      onSave({ ...current, channels: ['instagram', 'google'], status: 'posted' });
      onToast('Sent to Zapier ✓');
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'Failed — check webhook');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="ed-publish" style={{ padding: '14px 20px' }}>
      <button
        onClick={handlePost}
        disabled={posting}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '14px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14,
          letterSpacing: '.04em', cursor: posting ? 'not-allowed' : 'pointer', transition: '.15s',
          background: posting ? 'var(--line-soft)' : 'var(--navy-deep)',
          color: posting ? 'var(--muted)' : 'var(--gold-cta)',
        }}>
        <Icon n={posting ? 'refresh' : 'send'} size={16} />
        {posting ? 'Sending…' : 'Post to Social'}
      </button>
    </div>
  );
}

// ─── Right panel: image controls + AI assistant ─────────────────────────────────
function RightPanel({ current, img, imgPos, onImgPos, onSetImg, onUpdate, onToast, fileRef }: {
  current: ContentPiece; img: string | string[] | null;
  imgPos: { x: number; y: number }; onImgPos: (p: { x: number; y: number }) => void;
  onSetImg: (v: string | string[] | null) => void; onUpdate: (p: ContentPiece) => void;
  onToast: (msg: string) => void; fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [rightTab, setRightTab] = useState<'image' | 'content' | 'ai'>('image');
  const feedRef = useRef<HTMLDivElement>(null);
  const firstImg = Array.isArray(img) ? img[0] : img;
  const isAIImg = typeof firstImg === 'string' && firstImg.startsWith('data:image');

  useEffect(() => {
    setChat([{
      role: 'ai',
      text: `Here's your ${current.service} post — the testimonial is from ${current.proofUsed || 'a real client'}, matched specifically to ${current.service}. Tell me what to change.`,
      sugg: ['Punchier hook', 'Shorten caption', 'Try bold statement style', 'Make caption more emotional'],
    }]);
    setRightTab('image');
  }, [current.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { feedRef.current?.scrollTo(0, feedRef.current.scrollHeight); }, [chat, busy]);

  async function send(text?: string) {
    const t = (text || draft).trim(); if (!t || busy) return;
    if (/\b(generate|create|make|ai)\b.*\b(image|photo)\b/i.test(t) || /ai image/i.test(t)) {
      setChat(c => [...c, { role: 'user', text: t }]);
      setDraft('');
      setShowAIPanel(true);
      setChat(c => [...c, { role: 'ai', text: 'Opening AI Image Studio…', sugg: [] }]);
      return;
    }
    setChat(c => [...c, { role: 'user', text: t }]);
    setDraft('');
    setBusy(true);
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: t, hook: current.graphic.hook, caption: current.caption, service: current.service, audience: current.audience }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        const d = json.data;
        onUpdate({ ...current, graphic: { ...current.graphic, hook: d.hook || current.graphic.hook, emphasis: d.emphasis || current.graphic.emphasis, subhook: d.subhook || current.graphic.subhook }, caption: d.caption || current.caption });
      }
    } catch {}
    const l = t.toLowerCase();
    const reply = l.includes('short') ? 'Tightened it up — kept the problem, proof, and CTA.'
      : l.includes('hook') ? 'Fresh hook — still leads with the problem before the treatment.'
      : l.includes('proof') || l.includes('testimonial') ? `Used a real ${current.service} client testimonial.`
      : l.includes('emotion') ? 'Made it more human and personal — still brand-safe.'
      : 'Done — updated while keeping Five-Laws structure intact.';
    setChat(c => [...c, { role: 'ai', text: reply, sugg: ['Try again', 'Shorter', 'More emotional', 'AI Generate Image'] }]);
    setBusy(false);
  }

  const g = current.graphic;

  return (
    <div className="ed-right">
      {/* Tab switcher */}
      <div className="ed-right-tabs">
        {(['image', 'content', 'ai'] as const).map(tab => (
          <button key={tab} className={rightTab === tab ? 'on' : ''} onClick={() => setRightTab(tab)}>
            {tab === 'image' ? <><Icon n="image" size={13} /> Image</> : tab === 'content' ? <><Icon n="edit" size={13} /> Content</> : <><Icon n="sparkle" size={13} /> AI</>}
          </button>
        ))}
      </div>

      <div className="ed-right-body scrolly">

        {/* IMAGE TAB */}
        {rightTab === 'image' && (
          <div className="rp-section-group">
            {/* Current image preview */}
            <div className="rp-section">
              <div className="rp-label">Current Image</div>
              {firstImg ? (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1', background: 'var(--navy-deep)', marginBottom: 10 }}>
                  <img src={firstImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${imgPos.x}% ${imgPos.y}%` }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(1,24,54,.8)', backdropFilter: 'blur(4px)', borderRadius: 6, padding: '3px 8px', fontSize: 10.5, fontWeight: 700, color: '#D1BB74', letterSpacing: '.06em' }}>
                    {isAIImg ? '✨ AI GENERATED' : '📷 PHOTO'}
                  </div>
                  <button onClick={() => onSetImg(null)} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 6, background: 'rgba(239,68,68,.85)', border: 'none', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <Icon n="x" size={13} />
                  </button>
                </div>
              ) : (
                <div style={{ background: 'var(--cream)', border: '2px dashed var(--line)', borderRadius: 12, aspectRatio: '1', display: 'grid', placeItems: 'center', marginBottom: 10, cursor: 'pointer' }} onClick={() => setShowAIPanel(true)}>
                  <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    <Icon n="image" size={32} />
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8, color: 'var(--navy-mid)' }}>No image</div>
                    <div style={{ fontSize: 11, marginTop: 2 }}>Click to generate with AI</div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button className="rp-btn primary" onClick={() => setShowAIPanel(true)}>
                  <Icon n="sparkle" size={15} /> AI Generate
                </button>
                <button className="rp-btn" onClick={() => fileRef.current?.click()}>
                  <Icon n="upload" size={14} /> Upload Photo
                </button>
                <button className="rp-btn" onClick={async () => {
                  onToast('Generating a new AI image…');
                  try {
                    const res = await fetch('/api/generate-image', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ service: current.service, audience: current.audience }),
                    });
                    const json = await res.json();
                    if (json.ok && json.dataUrl) {
                      onSetImg(json.dataUrl);
                      onImgPos({ x: 50, y: 35 });
                      onToast('New AI image generated!');
                    } else {
                      onToast('Image generation failed — check OPENAI_API_KEY in Vercel');
                    }
                  } catch { onToast('Network error — try again'); }
                }}>
                  <Icon n="refresh" size={14} /> Regenerate
                </button>
                {firstImg && (
                  <button className="rp-btn danger" onClick={() => onSetImg(null)}>
                    <Icon n="trash" size={14} /> Remove
                  </button>
                )}
              </div>
            </div>

            {/* Position controls */}
            {firstImg && (
              <div className="rp-section">
                <div className="rp-label">Photo Position <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--muted)', fontSize: 10 }}>— or drag directly on canvas</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[{ label: 'Horizontal', key: 'x' as const, icon: '↔' }, { label: 'Vertical', key: 'y' as const, icon: '↕' }].map(({ label, key, icon }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', width: 18, textAlign: 'center' }}>{icon}</span>
                      <input type="range" min={0} max={100} value={imgPos[key]}
                        onChange={e => onImgPos({ ...imgPos, [key]: +e.target.value })}
                        style={{ flex: 1, accentColor: 'var(--gold)' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold-muted)', width: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{imgPos[key]}%</span>
                    </div>
                  ))}
                  <button className="rp-btn" onClick={() => onImgPos({ x: 50, y: 35 })} style={{ marginTop: 2 }}>Reset to center</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONTENT TAB */}
        {rightTab === 'content' && (
          <div className="rp-section-group">
            {/* Five Laws */}
            <div className="rp-section">
              <FiveLawsCard laws={current.fiveLaws} />
            </div>

            {/* Testimonial used */}
            <div className="rp-section">
              <div className="rp-label">Client Proof Used</div>
              <div style={{ background: 'var(--beige)', borderRadius: 12, padding: '14px 16px', borderLeft: '4px solid var(--gold)' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 14, color: 'var(--navy-mid)', lineHeight: 1.55, marginBottom: 8 }}>
                  &ldquo;{g.quote?.replace(/^"|"$/g, '')}&rdquo;
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-muted)' }}>— {current.proofUsed}</div>
                <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 4 }}>
                  Matched to {current.service} specifically
                </div>
              </div>
            </div>

            {/* Benefit icons reference */}
            <div className="rp-section">
              <div className="rp-label">Graphic Benefits</div>
              {(g.benefits || []).map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy-deep)', color: 'var(--gold-cta)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                    <Icon n={b[0]} size={14} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--navy-mid)' }}>{b[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI ASSISTANT TAB */}
        {rightTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-soft)', background: 'linear-gradient(135deg,rgba(1,24,54,.04),rgba(209,187,116,.04))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#011836,#0F1F3D)', display: 'grid', placeItems: 'center', color: '#D1BB74' }}>
                  <Icon n="sparkle" size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--navy-mid)' }}>Foothill Assistant</div>
                  <div style={{ fontSize: 10.5, color: 'var(--gold-muted)' }}>Brand-locked · Five-Laws aware</div>
                </div>
              </div>
            </div>

            <div className="scrolly" ref={feedRef} style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
              {chat.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, flex: 'none', display: 'grid', placeItems: 'center', background: m.role === 'ai' ? 'var(--navy-deep)' : 'var(--beige)', color: m.role === 'ai' ? 'var(--gold-cta)' : 'var(--navy-mid)', fontSize: 9, fontWeight: 700 }}>
                    {m.role === 'ai' ? <Icon n="sparkle" size={12} /> : 'You'}
                  </div>
                  <div style={{ background: m.role === 'ai' ? 'var(--cream)' : 'var(--navy-deep)', color: m.role === 'ai' ? 'var(--text)' : '#fff', padding: '10px 13px', borderRadius: 12, fontSize: 12.5, lineHeight: 1.5, maxWidth: 230, borderTopLeftRadius: m.role === 'ai' ? 3 : 12, borderTopRightRadius: m.role === 'user' ? 3 : 12 }}>
                    {m.text}
                    {m.sugg && m.sugg.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                        {m.sugg.map((s, k) => (
                          <button key={k} onClick={() => /ai image/i.test(s) ? setShowAIPanel(true) : send(s)}
                            style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy-mid)', background: '#fff', border: '1px solid var(--line)', borderRadius: 7, padding: '5px 9px', cursor: 'pointer' }}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--navy-deep)', color: 'var(--gold-cta)', display: 'grid', placeItems: 'center' }}><Icon n="sparkle" size={12} /></div>
                  <div style={{ background: 'var(--cream)', padding: '10px 13px', borderRadius: 12, borderTopLeftRadius: 3 }}>
                    <span style={{ display: 'inline-flex', gap: 4 }}><Dot /><Dot d={.2} /><Dot d={.4} /></span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick chips */}
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--line-soft)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Punchier hook', 'Shorten it', 'More emotional', 'AI Generate Image', 'Bold style'].map(s => (
                <button key={s} onClick={() => /ai image/i.test(s) ? (setShowAIPanel(true), setRightTab('image')) : send(s)}
                  style={{ fontSize: 11, fontWeight: 500, color: 'var(--gold-muted)', background: 'var(--cream)', border: '1px solid var(--line-soft)', borderRadius: 999, padding: '5px 10px', cursor: 'pointer' }}>{s}</button>
              ))}
            </div>

            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', gap: 8, border: '1.5px solid var(--line)', borderRadius: 12, padding: '8px 8px 8px 12px', background: '#fff' }}>
                <textarea rows={1} placeholder="Ask for a change…" value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 13, lineHeight: 1.4, maxHeight: 100, fontFamily: 'var(--body)', color: 'var(--text)', background: 'none' }} />
                <button disabled={!draft.trim() || busy} onClick={() => send()}
                  style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--navy-deep)', color: 'var(--gold-cta)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', opacity: (!draft.trim() || busy) ? .4 : 1 }}>
                  <Icon n="send" size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAIPanel && (
        <AIImagePanel service={current.service} audience={current.audience}
          onGenerated={url => { onSetImg(url); onImgPos({ x: 50, y: 35 }); onToast('AI image added!'); }}
          onClose={() => setShowAIPanel(false)} />
      )}
    </div>
  );
}

// ─── Studio root ────────────────────────────────────────────────────────────────
interface StudioProps {
  projects: ContentPiece[]; current: ContentPiece | null; generating: boolean;
  onSelect: (p: ContentPiece) => void; onUpdate: (p: ContentPiece) => void;
  onSave: (p: ContentPiece) => void; onPick: (type: string) => void; onToast: (msg: string) => void;
}

export default function Studio({ projects, current, generating, onSelect, onUpdate, onSave, onPick, onToast }: StudioProps) {
  const [img, setImg] = useState<string | string[] | null>(null);
  const [imgPos, setImgPos] = useState({ x: 50, y: 35 });
  const [chans, setChans] = useState<ChannelId[]>(['instagram']);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const webhooks = useStore(s => s.webhooks);

  useEffect(() => {
    setImg(current?.autoImage ?? null);
    setImgPos({ x: 50, y: 35 });
    setChans(current?.channels?.length ? current.channels as ChannelId[] : ['instagram']);
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function editField(field: string, val: string) {
    if (!current) return;
    if (field.startsWith('benefit:')) {
      const i = +field.split(':')[1];
      const benefits = (current.graphic.benefits || []).map((b, k) => k === i ? [b[0], val] as [string, string] : b);
      onUpdate({ ...current, graphic: { ...current.graphic, benefits } });
      return;
    }
    onUpdate({ ...current, graphic: { ...current.graphic, [field]: val } });
  }

  async function getExportDataUrl(): Promise<string | null> {
    try {
      const { toPng } = await import('html-to-image');
      const node = document.getElementById('export-canvas');
      if (!node) return null;
      const opts = {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
        skipFonts: true,          // fonts already loaded in browser — skip external fetch
        cacheBust: false,
        includeQueryParams: false,
      };
      // Two passes: first warms image cache, second renders cleanly
      await toPng(node, opts).catch(() => {});
      return await toPng(node, opts);
    } catch { return null; }
  }

  async function exportPng() {
    if (!current) return;
    try {
      const url = await getExportDataUrl();
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = current.service.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-post.png';
        a.click();
        onToast('Downloaded ' + a.download);
      }
    } catch { onToast('Export failed — try again'); }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setImg(r.result as string); onToast('Your photo is on the graphic'); };
    r.readAsDataURL(f);
  }

  if (generating) {
    return (
      <div className="ed-layout">
        <div style={{ gridColumn: '1/-1', position: 'relative' }}><GenOverlay /></div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="ed-layout">
        <div style={{ gridColumn: '1/-1', display: 'grid', placeItems: 'center', color: 'var(--muted)', textAlign: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 26, color: 'var(--navy-mid)', marginBottom: 10 }}>Nothing open yet</div>
            <p>Create your first piece of content.</p>
            <div style={{ marginTop: 20 }}><Btn variant="gold" icon="wand" onClick={() => onPick('ig-post')}>New Instagram Post</Btn></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ed-layout">
      {/* hidden export node */}
      <div style={{ position: 'fixed', left: -99999, top: 0 }}>
        <div id="export-canvas" style={{ width: 1080, height: 1080, position: 'relative' }}>
          <GraphicCanvas tpl={current.template} content={current.graphic} img={img} imgPos={imgPos} />
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      <LeftPanel
        projects={projects} current={current} onSelect={p => { onSelect(p); onUpdate(p); }} onPick={onPick}
      />

      <CanvasPanel
        current={current} img={img} imgPos={imgPos} onImgPos={setImgPos}
        onEditField={editField} onUpdate={onUpdate} onExport={exportPng} onToast={onToast}
        onSave={onSave} getExportDataUrl={getExportDataUrl}
      />

      <RightPanel
        current={current} img={img} imgPos={imgPos} onImgPos={setImgPos}
        onSetImg={setImg} onUpdate={onUpdate} onToast={onToast} fileRef={fileRef}
      />
    </div>
  );
}
