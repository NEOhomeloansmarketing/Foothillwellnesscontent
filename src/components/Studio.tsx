'use client';
import { useState, useEffect, useRef } from 'react';
import Icon from './ui/Icon';
import Social from './ui/Social';
import Btn from './ui/Btn';
import GraphicCanvas, { TEMPLATES } from './graphic/GraphicCanvas';
import { AUD, aiImageFor } from '@/lib/content';
import { useStore } from '@/store';
import type { ContentPiece, ChannelId, ChatMessage, FiveLaw } from '@/types';

function fmtDate(ts: number) {
  const d = new Date(ts), now = new Date();
  const diff = (now.getTime() - d.getTime()) / 86400000;
  if (diff < 1 && now.getDate() === d.getDate()) return 'Today';
  if (diff < 2) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const GEN_STEPS = [
  'Reading brand voice & Rosetta Stone…',
  'Leading with the client\'s problem…',
  'Matching a real client testimonial…',
  'Shaping hook, graphic & caption…',
  'Scoring against all Five Laws…',
];

const CHANNELS: [ChannelId, string][] = [
  ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['youtube', 'YT Shorts'], ['google', 'Google'],
];

function GenOverlay() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => Math.min(v + 1, GEN_STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="gen-overlay">
      <div className="gen-card">
        <div className="spin" />
        <div className="gt serif">Creating your content</div>
        <div className="gen-steps">
          {GEN_STEPS.map((s, k) => (
            <div key={k} className={`gen-step ${k < i ? 'done' : ''} ${k === i ? 'active' : ''}`}>
              <span className="gsdot">
                {k < i ? <Icon n="check" size={11} /> : k === i
                  ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'block' }} />
                  : null}
              </span>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Scorecard({ laws }: { laws: FiveLaw[] }) {
  const avg = (laws.reduce((a, b) => a + b.score, 0) / laws.length).toFixed(1);
  return (
    <div className="scorecard-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="eyebrow" style={{ color: 'var(--gold-muted)' }}>Five Laws Score</div>
        <span style={{ fontFamily: 'var(--display)', fontSize: 22, color: '#3f8a5b', fontWeight: 700 }}>
          {avg}<span style={{ fontSize: 13, color: 'var(--muted)' }}>/5</span>
        </span>
      </div>
      {laws.map((l, i) => (
        <div key={i} style={{ padding: '10px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy-mid)' }}>{l.law}</span>
            <span style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: n <= l.score ? 'var(--gold)' : 'var(--line)' }} />
              ))}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.45 }}>{l.note}</div>
        </div>
      ))}
    </div>
  );
}

function Dot({ d = 0 }: { d?: number }) {
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold-muted)', animation: `blink 1s ${d}s infinite`, display: 'inline-block' }} />;
}

function HistCol({ projects, current, onSelect, q, setQ }: {
  projects: ContentPiece[]; current: ContentPiece | null;
  onSelect: (p: ContentPiece) => void; q: string; setQ: (v: string) => void;
}) {
  const removeProject = useStore(s => s.removeProject);
  const addProject = useStore(s => s.addProject);
  const setToast = useStore(s => s.setToast);
  const toastT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const list = q ? projects.filter(p => (p.title + p.service).toLowerCase().includes(q.toLowerCase())) : projects;
  const groups: Record<string, ContentPiece[]> = {};
  list.forEach(p => { const k = fmtDate(p.createdAt); (groups[k] = groups[k] || []).push(p); });

  function handleDelete(p: ContentPiece, e: React.MouseEvent) {
    e.stopPropagation();
    removeProject(p.id);
    setToast(`Deleted "${p.title}"`);
    clearTimeout(toastT.current);
    // Offer undo via a second toast approach (we restore on another click)
    // For simplicity, just show confirmation
    const restored = { ...p };
    const undoMsg = document.createElement('div');
    undoMsg.style.cssText = 'position:fixed;bottom:88px;left:50%;transform:translateX(-50%);z-index:999;display:flex;align-items:center;gap:12px;background:#1c2433;color:#fff;padding:13px 20px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:0 8px 30px rgba(0,0,0,.3);';
    undoMsg.innerHTML = `<span>Deleted "${p.title}"</span><button style="background:var(--gold-cta,#D1BB74);color:#011836;border:none;padding:6px 14px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;">Undo</button>`;
    document.body.appendChild(undoMsg);
    const undoBtn = undoMsg.querySelector('button')!;
    const timer = setTimeout(() => undoMsg.remove(), 4000);
    undoBtn.onclick = () => {
      clearTimeout(timer);
      addProject(restored);
      undoMsg.remove();
    };
  }

  return (
    <div className="hist">
      <div className="hist-head">
        <div className="eyebrow">Library</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{projects.length} piece{projects.length !== 1 ? 's' : ''}</div>
      </div>
      <div className="hist-search">
        <Icon n="search" size={15} />
        <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="hist-list scrolly">
        {Object.keys(groups).length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 12.5 }}>
            No content yet.<br />Click <b>New</b> to create your first piece.
          </div>
        )}
        {Object.keys(groups).map(day => (
          <div key={day}>
            <div className="hist-day">{day}</div>
            {groups[day].map(p => (
              <div key={p.id} className={`hist-item-wrap ${current?.id === p.id ? 'on' : ''}`}>
                <button className="hist-item" onClick={() => onSelect(p)}>
                  <div className="ht">
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: 'scale(.0389)', transformOrigin: 'top left' }}>
                      <GraphicCanvas tpl={p.template} content={p.graphic} />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="hi-t">{p.title}</div>
                    <div className="hi-m">
                      <span className={`hi-status ${p.status}`}>{p.status}</span>
                      {p.channels.length > 0 && <span>· {p.channels.length} ch</span>}
                    </div>
                  </div>
                </button>
                <button className="hist-del" title="Delete" onClick={(e) => handleDelete(p, e)}>
                  <Icon n="trash" size={13} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Image Generation Panel
function ImageGenPanel({ service, audience, onGenerated, onClose }: {
  service: string; audience: string; onGenerated: (url: string) => void; onClose: () => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const suggestions = [
    'Person looking relieved and relaxed',
    'Clean clinical spa interior',
    'Glowing healthy skin close-up',
    'Confident person in activewear',
    'Serene treatment room',
  ];

  async function generate() {
    setLoading(true);
    setError('');
    setPreview('');
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, service, audience }),
      });
      const json = await res.json();
      if (json.ok && json.dataUrl) {
        setPreview(json.dataUrl);
      } else {
        setError(json.error || 'Image generation failed. Make sure OPENAI_API_KEY is set in Vercel.');
      }
    } catch {
      setError('Network error — check your API key configuration.');
    }
    setLoading(false);
  }

  return (
    <div className="imggen-panel">
      <div className="imggen-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#011836,#0F1F3D)', display: 'grid', placeItems: 'center', color: '#D1BB74' }}>
            <Icon n="sparkle" size={16} />
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy-mid)' }}>AI Image Studio</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Powered by DALL·E 3 · Wellness-tuned</div>
          </div>
        </div>
        <button className="iconbtn" onClick={onClose}><Icon n="x" size={16} /></button>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 8 }}>
          Describe what you want to see
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            rows={3}
            placeholder={`e.g. "A woman looking relaxed and refreshed after a treatment, warm natural light..."`}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            style={{ width: '100%', resize: 'none', border: '1.5px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--text)', background: '#fff', outline: 'none', lineHeight: 1.5 }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--gold-cta)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--line)'}
          />
        </div>

        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map(s => (
            <button key={s} className="sugg-chip" onClick={() => setPrompt(s)}>{s}</button>
          ))}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <Btn variant="gold" icon="sparkle" onClick={generate} style={{ flex: 1 }}>
            {loading ? 'Generating…' : 'Generate Image'}
          </Btn>
          {preview && (
            <Btn variant="ghost" icon="check" onClick={() => { onGenerated(preview); onClose(); }}>
              Use This
            </Btn>
          )}
        </div>

        {loading && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 0' }}>
            <div className="spin" />
            <div style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Creating a wellness-tuned image for <b>{service}</b>…<br />
              <span style={{ fontSize: 11 }}>This takes 15–30 seconds with DALL·E 3</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 12, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 9, padding: '12px 14px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>Image generation unavailable</div>
            <div style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.5 }}>{error}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
              To enable: add <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 4 }}>OPENAI_API_KEY</code> to your Vercel environment variables.
            </div>
          </div>
        )}

        {preview && !loading && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 8 }}>Preview</div>
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1', background: 'var(--navy-deep)' }}>
              <img src={preview} alt="AI generated" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12, background: 'linear-gradient(transparent,rgba(1,24,54,.7))' }}>
                <button
                  onClick={() => { onGenerated(preview); onClose(); }}
                  style={{ width: '100%', background: 'var(--gold-cta)', color: 'var(--navy-deep)', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  ✓ Use This Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StudioProps {
  projects: ContentPiece[];
  current: ContentPiece | null;
  generating: boolean;
  onSelect: (p: ContentPiece) => void;
  onUpdate: (p: ContentPiece) => void;
  onSave: (p: ContentPiece) => void;
  onPick: (type: string) => void;
  onToast: (msg: string) => void;
}

export default function Studio({ projects, current, generating, onSelect, onUpdate, onSave, onPick, onToast }: StudioProps) {
  const [tab, setTab] = useState<'graphic' | 'caption'>('graphic');
  const [img, setImg] = useState<string | string[] | null>(null);
  const [imgPos, setImgPos] = useState({ x: 50, y: 35 });
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [chans, setChans] = useState<ChannelId[]>(['instagram']);
  const [showScore, setShowScore] = useState(false);
  const [showImgGen, setShowImgGen] = useState(false);
  const [rightTab, setRightTab] = useState<'assistant' | 'style'>('assistant');
  const [q, setQ] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImg(current?.autoImage ?? null);
    setImgPos({ x: 50, y: 35 });
    setTab('graphic');
    setShowImgGen(false);
    setChans(current?.channels?.length ? current.channels as ChannelId[] : ['instagram']);
    setChat(current ? [{
      role: 'ai',
      text: `Here's your ${current.service} post for the ${AUD[current.audience]} audience. The testimonial is from ${current.proofUsed || 'a real Foothill client'} — selected because it directly mentions ${current.service}.\n\nClick any text on the graphic to edit it in place, or tell me what to change.`,
      sugg: ['Punchier hook', 'Make caption shorter', 'Add a testimonial', 'AI Generate Image'],
    }] : []);
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [chat, busy]);

  if (generating) {
    return (
      <div className="studio">
        <HistCol projects={projects} current={current} onSelect={onSelect} q={q} setQ={setQ} />
        <div className="stage" style={{ position: 'relative' }}><GenOverlay /></div>
        <div className="assist" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="studio">
        <HistCol projects={projects} current={current} onSelect={onSelect} q={q} setQ={setQ} />
        <div className="stage">
          <div className="empty">
            <div>
              <div className="serif" style={{ fontSize: 22, color: 'var(--navy-mid)' }}>Nothing open yet</div>
              <p style={{ color: 'var(--muted)', marginTop: 10 }}>Pick a format to create something new.</p>
              <div style={{ marginTop: 20 }}><Btn variant="gold" icon="wand" onClick={() => onPick('ig-post')}>New content</Btn></div>
            </div>
          </div>
        </div>
        <div className="assist" />
      </div>
    );
  }

  const g = current.graphic;

  function editField(field: string, val: string) {
    if (field.startsWith('benefit:')) {
      const i = +field.split(':')[1];
      const benefits = (current!.graphic.benefits || []).map((b, k) => k === i ? [b[0], val] as [string, string] : b);
      onUpdate({ ...current!, graphic: { ...current!.graphic, benefits } });
      return;
    }
    onUpdate({ ...current!, graphic: { ...current!.graphic, [field]: val } });
  }

  function shuffleImg() {
    const s = Date.now();
    const src = aiImageFor(current!.imgKeywords || 'general', s, current!.audience);
    setImg(src);
    onToast('Shuffled to a fresh wellness photo');
  }

  async function send(text?: string) {
    const t = (text || draft).trim();
    if (!t || busy) return;

    // Detect AI image generation request
    if (/\b(generate|create|make|ai)\b.*\b(image|photo|picture|graphic)\b/i.test(t) || /\bai image\b/i.test(t)) {
      setChat(c => [...c, { role: 'user', text: t }]);
      setDraft('');
      setShowImgGen(true);
      setChat(c => [...c, { role: 'ai', text: 'Opening the AI Image Studio — describe what you want and I\'ll generate it with DALL·E 3.', sugg: [] }]);
      return;
    }

    setChat(c => [...c, { role: 'user', text: t }]);
    setDraft('');
    setBusy(true);
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: t,
          hook: current!.graphic.hook,
          caption: current!.caption,
          service: current!.service,
          audience: current!.audience,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        const d = json.data;
        onUpdate({
          ...current!,
          graphic: { ...current!.graphic, hook: d.hook || g.hook, emphasis: d.emphasis || g.emphasis, subhook: d.subhook || g.subhook },
          caption: d.caption || current!.caption,
        });
      }
    } catch {}
    setChat(c => [...c, { role: 'ai', text: revNote(t), sugg: ['Try another angle', 'Make it shorter', 'AI Generate Image', 'Download PNG'] }]);
    setBusy(false);
  }

  function revNote(t: string) {
    const l = t.toLowerCase();
    if (l.includes('short')) return 'Tightened it up — kept the problem, the proof, and the CTA. Still passes all Five Laws.';
    if (l.includes('hook')) return 'Fresh hook in place — still leads with the problem before the treatment (Law 2 is strong).';
    if (/proof|testimonial/.test(l)) return `Pulled in a matching ${current!.service} client story to raise perceived likelihood (Law 3).`;
    if (/offer|deal|special/.test(l)) return 'Worked the offer in near the CTA so it feels easy to act on (Law 5), without leading with the sale.';
    if (/longer|more detail/.test(l)) return 'Expanded the copy with more context — still following the Problem→Action sequence.';
    return 'Done — updated the copy while keeping brand voice and the Five-Laws structure intact.';
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      setImg(result);
      onToast('Your photo is now on the graphic');
    };
    r.readAsDataURL(f);
  }

  async function exportPng() {
    try {
      const { toPng } = await import('html-to-image');
      const node = document.getElementById('export-canvas');
      if (node) {
        const url = await toPng(node, { width: 1080, height: 1080, pixelRatio: 1, cacheBust: true });
        const a = document.createElement('a');
        a.href = url;
        a.download = (current!.service || 'foothill').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-post.png';
        a.click();
        onToast('Downloaded ' + a.download + ' (1080×1080)');
      }
    } catch {
      onToast('Could not export — try again');
    }
  }

  function publish() {
    if (!chans.length) { onToast('Pick at least one channel'); return; }
    onSave({ ...current!, channels: chans, status: 'scheduled' });
    onToast('Scheduled to ' + CHANNELS.filter(c => chans.includes(c[0])).map(c => c[1]).join(', '));
  }

  const imgSrcs = img ? (Array.isArray(img) ? img : [img]) : null;
  const firstImg = imgSrcs?.[0];

  return (
    <div className="studio">
      <HistCol projects={projects} current={current} onSelect={onSelect} q={q} setQ={setQ} />

      {/* hidden export canvas */}
      <div style={{ position: 'fixed', left: -99999, top: 0 }}>
        <div id="export-canvas" style={{ width: 1080, height: 1080, position: 'relative', background: '#fff' }}>
          <GraphicCanvas tpl={current.template} content={g} img={img} imgPos={imgPos} />
        </div>
      </div>

      {/* Center Stage */}
      <div className="stage scrolly" onClick={() => showScore && setShowScore(false)}>
        {/* Top bar */}
        <div className="stage-bar">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="title serif" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current.service}</div>
            <div className="sub">{AUD[current.audience]} · {current.goal}</div>
          </div>
          <div className="tabs">
            <button className={tab === 'graphic' ? 'on' : ''} onClick={() => setTab('graphic')}>Graphic</button>
            <button className={tab === 'caption' ? 'on' : ''} onClick={() => setTab('caption')}>Caption</button>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="compliance" onClick={() => setShowScore(s => !s)}>
              <span className="led" /> Five-Laws <Icon n="chevD" size={13} />
            </button>
            {showScore && <Scorecard laws={current.fiveLaws} />}
          </div>
        </div>

        <div className="stage-scroll">
          {tab === 'graphic' && (
            <div className="canvas-wrap">
              {/* Canvas */}
              <div className="canvas-frame">
                <div className="canvas-scaler">
                  <GraphicCanvas tpl={current.template} content={g} img={img} imgPos={imgPos} edit={{ on: true, set: editField }} />
                </div>
              </div>
              <div className="edit-hint"><Icon n="edit" size={13} /> <b>Click any text</b> to edit it directly on the graphic</div>

              {/* Template picker — larger, named */}
              <div className="tpl-section">
                <div className="tpl-section-label">Layout Style</div>
                <div className="template-row-lg">
                  {TEMPLATES.map(t => (
                    <button key={t.id} className={`tpl-thumb-lg ${current.template === t.id ? 'on' : ''}`}
                      onClick={() => onUpdate({ ...current!, template: t.id })}>
                      <div className="mini-lg">
                        <GraphicCanvas tpl={t.id} content={g} img={img} imgPos={imgPos} />
                      </div>
                      <span className="tpl-name">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image controls */}
              <div className="img-controls">
                <div className="img-controls-label">Photo &amp; Image</div>
                <div className="img-controls-row">
                  <button className="img-ctrl-btn ai" onClick={() => setShowImgGen(v => !v)}>
                    <Icon n="sparkle" size={16} />
                    <span>AI Generate</span>
                  </button>
                  <button className="img-ctrl-btn" onClick={() => fileRef.current?.click()}>
                    <Icon n="upload" size={15} />
                    <span>Upload</span>
                  </button>
                  <button className="img-ctrl-btn" onClick={shuffleImg}>
                    <Icon n="refresh" size={15} />
                    <span>Shuffle</span>
                  </button>
                  {img && (
                    <button className="img-ctrl-btn danger" onClick={() => setImg(null)}>
                      <Icon n="x" size={15} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Position sliders — only when image exists */}
                {img && (
                  <div className="img-pos-controls">
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 8 }}>
                      Photo Position
                    </div>
                    <div className="img-pos-row">
                      <span className="pos-label">← H →</span>
                      <input type="range" min={0} max={100} value={imgPos.x}
                        onChange={e => setImgPos(p => ({ ...p, x: +e.target.value }))}
                        className="pos-slider" />
                      <span className="pos-val">{imgPos.x}%</span>
                    </div>
                    <div className="img-pos-row">
                      <span className="pos-label">↑ V ↓</span>
                      <input type="range" min={0} max={100} value={imgPos.y}
                        onChange={e => setImgPos(p => ({ ...p, y: +e.target.value }))}
                        className="pos-slider" />
                      <span className="pos-val">{imgPos.y}%</span>
                    </div>
                  </div>
                )}

                {/* Image thumbnail when set */}
                {firstImg && (
                  <div className="img-preview-strip">
                    <img src={firstImg} alt="" className="img-prev-thumb" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {firstImg.startsWith('data:') ? 'Uploaded photo' : firstImg.startsWith('https://images.unsplash') ? 'Wellness photo' : 'AI Generated Image'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {firstImg.startsWith('data:image/png;base64') ? 'DALL·E 3 · AI Generated' : 'Drag sliders to reposition'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

              {/* AI Image Gen Panel */}
              {showImgGen && (
                <ImageGenPanel
                  service={current.service}
                  audience={current.audience}
                  onGenerated={(url) => { setImg(url); setImgPos({ x: 50, y: 35 }); onToast('AI image added to your graphic!'); }}
                  onClose={() => setShowImgGen(false)}
                />
              )}

              {/* Export + Publish actions */}
              <div className="canvas-actions">
                <Btn variant="navy" icon="download" onClick={exportPng}>Download PNG</Btn>
                <Btn variant="ghost" icon="copy" onClick={() => {
                  navigator.clipboard?.writeText(current.caption + '\n\n' + current.hashtags.join(' '));
                  onToast('Caption copied to clipboard');
                }}>Copy Caption</Btn>
              </div>
            </div>
          )}

          {tab === 'caption' && (
            <div className="copy-panel">
              <div className="copy-block">
                <div className="cb-head">
                  <span className="lbl">Caption</span>
                  <button className="btn btn-quiet" style={{ fontSize: 12 }} onClick={() => {
                    navigator.clipboard?.writeText(current.caption + '\n\n' + current.hashtags.join(' '));
                    onToast('Caption copied');
                  }}><Icon n="copy" size={14} /> Copy all</button>
                </div>
                <div className="cb-body ged" contentEditable suppressContentEditableWarning spellCheck={false}
                  onBlur={e => { const t = e.currentTarget.innerText.trim(); if (t) onUpdate({ ...current!, caption: t }); }}>
                  {current.caption}
                </div>
                <div className="copy-mini">Click to edit · auto-saves on blur</div>
                <div className="cb-body" style={{ paddingTop: 0 }}>
                  <span className="hashtags ged" style={{ display: 'block', color: 'var(--gold-muted)', fontWeight: 500 }}
                    contentEditable suppressContentEditableWarning spellCheck={false}
                    onBlur={e => { const t = e.currentTarget.innerText.trim(); onUpdate({ ...current!, hashtags: t.split(/\s+/).filter(Boolean) }); }}>
                    {current.hashtags.join('  ')}
                  </span>
                </div>
              </div>

              {/* Testimonial matched */}
              <div className="copy-block">
                <div className="cb-head">
                  <span className="lbl">Client Testimonial Used</span>
                  <span className="tag" style={{ fontSize: 10 }}>
                    {current.proofUsed ? 'Service-matched' : 'Audience-matched'}
                  </span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 15, color: 'var(--navy-mid)', lineHeight: 1.55 }}>
                    &ldquo;{current.graphic.quote?.replace(/^"|"$/g, '')}&rdquo;
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--gold-muted)' }}>— {current.proofUsed}</div>
                </div>
              </div>

              <div className="copy-block">
                <div className="cb-head"><span className="lbl">Alternate Hooks</span><span style={{ fontSize: 11, color: 'var(--muted)' }}>tap to swap</span></div>
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {(current.altHooks || []).map((h, i) => (
                    <button key={i} className="opt" style={{ padding: '11px 13px' }}
                      onClick={() => onUpdate({ ...current!, graphic: { ...g, hook: h } })}>
                      <span style={{ fontSize: 13.5, color: 'var(--navy-mid)', fontWeight: 500, textAlign: 'left' }}>{h}</span>
                      {g.hook === h && <span className="tag" style={{ marginLeft: 'auto' }}>in use</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Publish bar */}
        <div className="publish">
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)' }}>Publish to</span>
          <div className="chan-row">
            {CHANNELS.map(([id, label]) => (
              <button key={id} className={`chan ${chans.includes(id) ? 'on' : ''}`} title={label}
                onClick={() => setChans(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])}>
                <Social n={id} size={18} />
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="calendar" onClick={() => onToast('Calendar scheduling — connect your accounts to enable')}>Schedule</Btn>
          <Btn variant="gold" icon="send" onClick={publish}>Post now</Btn>
        </div>
      </div>

      {/* Right Panel */}
      <div className="assist">
        <div className="assist-tabs">
          <button className={rightTab === 'assistant' ? 'on' : ''} onClick={() => setRightTab('assistant')}>
            <Icon n="sparkle" size={14} /> Assistant
          </button>
          <button className={rightTab === 'style' ? 'on' : ''} onClick={() => setRightTab('style')}>
            <Icon n="edit" size={14} /> Style
          </button>
        </div>

        {rightTab === 'assistant' && (
          <>
            <div className="assist-head">
              <div className="ai"><Icon n="sparkle" size={18} /></div>
              <div style={{ flex: 1 }}>
                <div className="at">Foothill Assistant</div>
                <div className="as">Brand-locked · Five-Laws aware · Real testimonials</div>
              </div>
            </div>
            <div className="assist-feed scrolly" ref={feedRef}>
              {chat.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="mav">{m.role === 'ai' ? <Icon n="sparkle" size={13} /> : 'You'}</div>
                  <div>
                    <div className="bubble">
                      {m.text}
                      {m.sugg && m.sugg.length > 0 && (
                        <div className="sugg">
                          {m.sugg.map((s, k) => (
                            <button key={k} onClick={() =>
                              /png|download/i.test(s) ? exportPng()
                              : /ai.*image|generate image/i.test(s) ? (setShowImgGen(true), setTab('graphic'))
                              : /proof layout/i.test(s) ? onUpdate({ ...current!, template: 'proof' })
                              : /shuffle|image|photo/i.test(s) ? shuffleImg()
                              : send(s)
                            }>{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {busy && (
                <div className="msg ai">
                  <div className="mav"><Icon n="sparkle" size={13} /></div>
                  <div className="bubble"><span style={{ display: 'inline-flex', gap: 4 }}><Dot /><Dot d={.2} /><Dot d={.4} /></span></div>
                </div>
              )}
            </div>

            <div className="assist-quick">
              {['Punchier hook', 'Shorten caption', 'Add testimonial', 'AI Generate Image', 'Bold statement style'].map(s => (
                <button key={s} onClick={() =>
                  /ai.*image|generate image/i.test(s) ? (setShowImgGen(true), setTab('graphic'), setRightTab('assistant'))
                  : send(s)
                }>{s}</button>
              ))}
            </div>

            <div className="assist-input">
              <div className="assist-box">
                <button className="iconbtn" style={{ width: 30, height: 30 }} title="Upload image" onClick={() => fileRef.current?.click()}>
                  <Icon n="image" size={18} />
                </button>
                <textarea rows={1} placeholder={'Ask for a change… or "generate an AI image"'}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <button className="send" disabled={!draft.trim() || busy} onClick={() => send()}>
                  <Icon n="send" size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {rightTab === 'style' && (
          <div className="style-panel scrolly">
            {/* Five Laws Scorecard */}
            <div style={{ padding: '14px 18px 0' }}>
              <Scorecard laws={current.fiveLaws} />
            </div>

            {/* Testimonial info */}
            <div style={{ margin: '14px 18px 0', background: 'var(--beige)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 8 }}>
                Client Proof Used
              </div>
              <div style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 13, color: 'var(--navy-mid)', lineHeight: 1.55 }}>
                &ldquo;{current.graphic.quote?.replace(/^"|"$/g, '').slice(0, 100)}…&rdquo;
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-muted)', marginTop: 6 }}>— {current.proofUsed}</div>
            </div>

            {/* Template section */}
            <div style={{ padding: '18px 18px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 12 }}>
                Layout Style
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TEMPLATES.map(t => (
                  <button key={t.id}
                    onClick={() => onUpdate({ ...current!, template: t.id })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10,
                      border: `1.5px solid ${current.template === t.id ? 'var(--navy-deep)' : 'var(--line)'}`,
                      background: current.template === t.id ? 'var(--navy-deep)' : '#fff',
                      cursor: 'pointer', textAlign: 'left', transition: '.14s',
                    }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 7, overflow: 'hidden', flex: 'none',
                      position: 'relative', background: 'var(--navy-deep)',
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: 'scale(.0407)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                        <GraphicCanvas tpl={t.id} content={g} img={img} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: current.template === t.id ? '#fff' : 'var(--navy-mid)' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: current.template === t.id ? 'rgba(255,255,255,.65)' : 'var(--muted)' }}>
                        {t.id === 'educate' ? 'Editorial split column' : t.id === 'statement' ? 'Bold full-bleed text' : t.id === 'proof' ? 'Client testimonial' : t.id === 'photo' ? 'Full-bleed lifestyle photo' : 'Photo left + info right'}
                      </div>
                    </div>
                    {current.template === t.id && (
                      <span style={{ marginLeft: 'auto', color: 'var(--gold-cta)' }}><Icon n="check" size={16} /></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 40 }} />
          </div>
        )}
      </div>
    </div>
  );
}
