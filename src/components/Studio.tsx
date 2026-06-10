'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from './ui/Icon';
import Social from './ui/Social';
import Btn from './ui/Btn';
import GraphicCanvas, { TEMPLATES } from './graphic/GraphicCanvas';
import { AUD, aiImageFor } from '@/lib/content';
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
  'Reading the Rosetta Stone & brand voice…',
  'Leading with the client\'s problem…',
  'Matching a real client testimonial…',
  'Shaping the hook, caption & graphic…',
  'Scoring against the Five Laws…',
];

const CHANNELS: [ChannelId, string][] = [
  ['instagram','Instagram'],['facebook','Facebook'],['tiktok','TikTok'],['youtube','YT Shorts'],['google','Google'],
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
                {k < i ? <Icon n="check" size={11} /> : k === i ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'block' }} /> : null}
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
    <div className="card" style={{ position: 'absolute', top: 48, right: 0, width: 340, zIndex: 50, padding: 16, boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="eyebrow" style={{ color: 'var(--gold-muted)' }}>Five Laws Scorecard</div>
        <span style={{ fontFamily: 'var(--display)', fontSize: 20, color: '#3f8a5b' }}>{avg}<span style={{ fontSize: 12, color: 'var(--muted)' }}>/5</span></span>
      </div>
      {laws.map((l, i) => (
        <div key={i} style={{ padding: '9px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy-mid)' }}>{l.law}</span>
            <span style={{ display: 'flex', gap: 3 }}>{[1,2,3,4,5].map(n => <span key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: n <= l.score ? 'var(--gold)' : 'var(--line)' }} />)}</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>{l.note}</div>
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
  const list = q ? projects.filter(p => (p.title + p.service).toLowerCase().includes(q.toLowerCase())) : projects;
  const groups: Record<string, ContentPiece[]> = {};
  list.forEach(p => { const k = fmtDate(p.createdAt); (groups[k] = groups[k] || []).push(p); });

  return (
    <div className="hist">
      <div className="hist-head"><div className="eyebrow">Your library</div></div>
      <div className="hist-search"><Icon n="search" size={15} /><input placeholder="Search past content…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <div className="hist-list scrolly">
        {Object.keys(groups).map(day => (
          <div key={day}>
            <div className="hist-day">{day}</div>
            {groups[day].map(p => (
              <button key={p.id} className={`hist-item ${current?.id === p.id ? 'on' : ''}`} onClick={() => onSelect(p)}>
                <div className="ht">
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: 'scale(.0389)', transformOrigin: 'top left' }}>
                    <GraphicCanvas tpl={p.template} content={p.graphic} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="hi-t">{p.title}</div>
                  <div className="hi-m">{p.channels.length ? p.status : 'Draft'}</div>
                </div>
              </button>
            ))}
          </div>
        ))}
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
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [chans, setChans] = useState<ChannelId[]>(['instagram']);
  const [showScore, setShowScore] = useState(false);
  const [q, setQ] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImg(current?.autoImage ?? null);
    setTab('graphic');
    setChans(current?.channels?.length ? current.channels as ChannelId[] : ['instagram']);
    setChat(current ? [{
      role: 'ai',
      text: `Here's your ${current.service} post for the ${AUD[current.audience]} audience — led with their problem and matched to a real client story.${current.template === 'photo' ? ' I also auto-added a relevant photo — swap in your own clinic shot anytime.' : ''} Click any text on the graphic to edit it, or just tell me what to change.`,
      sugg: ['Punchier hook', 'Make caption shorter', 'Shuffle the image', 'Try the Proof layout'],
    }] : []);
  }, [current?.id]);

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
              <div className="serif">Nothing open yet</div>
              <p>Pick a format to create something new.</p>
              <div style={{ marginTop: 16 }}><Btn variant="gold" icon="wand" onClick={() => onPick('ig-post')}>New content</Btn></div>
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
    const src = aiImageFor(current!.imgKeywords || 'wellness,spa', s);
    setImg(src);
    if (['statement', 'proof', 'editorial'].includes(current!.template)) {
      onUpdate({ ...current!, template: 'photo' });
      onToast('AI chose a fresh photo & switched to the Photo layout');
    } else {
      onToast('AI chose a fresh, on-topic photo');
    }
  }

  async function send(text?: string) {
    const t = (text || draft).trim();
    if (!t || busy) return;
    setChat(c => [...c, { role: 'user', text: t }]);
    setDraft('');
    setBusy(true);
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: t, hook: current!.graphic.hook, caption: current!.caption }),
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
    setChat(c => [...c, { role: 'ai', text: revNote(t), sugg: ['Try another hook', 'Make it shorter', 'Add a testimonial', 'Download PNG'] }]);
    setBusy(false);
  }

  function revNote(t: string) {
    const l = t.toLowerCase();
    if (l.includes('short')) return 'Tightened it up — kept the problem, the proof, and the call to action. Still passes all five laws.';
    if (l.includes('hook')) return 'Fresh hook in place. It still leads with the problem before the treatment — Law 2 stays strong.';
    if (l.includes('proof') || l.includes('testimonial')) return 'Pulled in a matching client story to raise perceived likelihood of success (Law 3).';
    if (l.includes('offer') || l.includes('deal') || l.includes('special')) return 'Worked the offer in near the CTA so it feels easy to act on (Law 5) without leading with it.';
    return 'Done — updated the copy while keeping the brand voice and the Five-Laws structure intact.';
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      setImg(result);
      if (current!.template !== 'photo') {
        onUpdate({ ...current!, template: 'photo' });
        onToast('Photo added — switched to the Photo layout');
      } else {
        onToast('Photo added to your graphic');
      }
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
    onToast('Scheduled to ' + chans.length + ' channel' + (chans.length > 1 ? 's' : '') + ' · ' + CHANNELS.filter(c => chans.includes(c[0])).map(c => c[1]).join(', '));
  }

  return (
    <div className="studio">
      <HistCol projects={projects} current={current} onSelect={onSelect} q={q} setQ={setQ} />

      {/* hidden export node */}
      <div style={{ position: 'fixed', left: -99999, top: 0 }}>
        <div id="export-canvas" style={{ width: 1080, height: 1080, position: 'relative', background: '#fff' }}>
          <GraphicCanvas tpl={current.template} content={g} img={img} />
        </div>
      </div>

      <div className="stage scrolly">
        <div className="stage-bar">
          <div style={{ flex: 1 }}>
            <div className="title serif">{current.service}</div>
            <div className="sub">{AUD[current.audience]} · {current.goal} · Instagram Post</div>
          </div>
          <div className="tabs">
            <button className={tab === 'graphic' ? 'on' : ''} onClick={() => setTab('graphic')}>Graphic</button>
            <button className={tab === 'caption' ? 'on' : ''} onClick={() => setTab('caption')}>Caption</button>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="compliance" onClick={() => setShowScore(s => !s)}>
              <span className="led" /> Five-Laws aligned <Icon n="chevD" size={13} />
            </button>
            {showScore && <Scorecard laws={current.fiveLaws} />}
          </div>
        </div>

        <div className="stage-scroll" onClick={() => showScore && setShowScore(false)}>
          {tab === 'graphic' && (
            <div className="canvas-wrap">
              <div className="canvas-frame">
                <div className="canvas-scaler">
                  <GraphicCanvas tpl={current.template} content={g} img={img} edit={{ on: true, set: editField }} />
                </div>
              </div>
              <div className="edit-hint"><Icon n="edit" size={14} /> <b>Click any text</b> on the graphic to edit it in place</div>
              <div className="template-row">
                {TEMPLATES.map(t => (
                  <button key={t.id} className={`tpl-thumb ${current.template === t.id ? 'on' : ''}`} title={t.name}
                    onClick={() => onUpdate({ ...current!, template: t.id })}>
                    <div className="mini"><GraphicCanvas tpl={t.id} content={g} img={img} /></div>
                  </button>
                ))}
                <span style={{ fontSize: 11.5, color: 'var(--muted)', marginLeft: 6 }}>5 layouts</span>
              </div>
              <div className="canvas-actions">
                <Btn variant="navy" icon="download" onClick={exportPng}>Download PNG</Btn>
                <Btn variant="ghost" icon="refresh" onClick={shuffleImg}>{img && current.template === 'photo' ? 'Shuffle image' : 'AI image'}</Btn>
                <Btn variant="ghost" icon="upload" onClick={() => fileRef.current?.click()}>{img ? 'Replace photo' : 'Add photo'}</Btn>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
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
                  }}><Icon n="copy" size={14} /> Copy</button>
                </div>
                <div className="cb-body ged" contentEditable suppressContentEditableWarning spellCheck={false}
                  onBlur={e => { const t = e.currentTarget.innerText.trim(); if (t) onUpdate({ ...current!, caption: t }); }}>
                  {current.caption}
                </div>
                <div className="copy-mini">Click to edit · hashtags below</div>
                <div className="cb-body" style={{ paddingTop: 0 }}>
                  <span className="hashtags ged" style={{ display: 'block', color: 'var(--gold-muted)', fontWeight: 500 }}
                    contentEditable suppressContentEditableWarning spellCheck={false}
                    onBlur={e => { const t = e.currentTarget.innerText.trim(); onUpdate({ ...current!, hashtags: t.split(/\s+/).filter(Boolean) }); }}>
                    {current.hashtags.join('  ')}
                  </span>
                </div>
              </div>
              <div className="copy-block">
                <div className="cb-head"><span className="lbl">Alternate hooks</span><span style={{ fontSize: 11, color: 'var(--muted)' }}>tap to use</span></div>
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
          <Btn variant="ghost" icon="calendar" onClick={() => onToast('Scheduling calendar — connect your accounts to enable')}>Schedule</Btn>
          <Btn variant="gold" icon="send" onClick={publish}>Post now</Btn>
        </div>
      </div>

      {/* Assistant */}
      <div className="assist">
        <div className="assist-head">
          <div className="ai"><Icon n="sparkle" size={18} /></div>
          <div style={{ flex: 1 }}>
            <div className="at">Foothill Assistant</div>
            <div className="as">Brand-locked · Five-Laws aware</div>
          </div>
        </div>
        <div className="assist-feed scrolly" ref={feedRef}>
          {chat.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="mav">{m.role === 'ai' ? <Icon n="sparkle" size={13} /> : 'You'}</div>
              <div>
                <div className="bubble">
                  {m.text}
                  {m.sugg && (
                    <div className="sugg">
                      {m.sugg.map((s, k) => (
                        <button key={k} onClick={() =>
                          /png|download/i.test(s) ? exportPng()
                          : /image|photo/i.test(s) ? shuffleImg()
                          : /proof layout/i.test(s) ? onUpdate({ ...current!, template: 'proof' })
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
        {img && (
          <div className="upl-row">
            <img className="upl-thumb" src={Array.isArray(img) ? img[0] : img} alt="" />
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Photo in use · Photo layout</span>
            <button className="btn btn-quiet" style={{ fontSize: 11, marginLeft: 'auto' }} onClick={() => setImg(null)}>Remove</button>
          </div>
        )}
        <div className="assist-quick">
          {['Punchier hook','Shorten it','Add a testimonial','Shuffle image'].map(s => (
            <button key={s} onClick={() => /image|photo/i.test(s) ? shuffleImg() : send(s)}>{s}</button>
          ))}
        </div>
        <div className="assist-input">
          <div className="assist-box">
            <button className="iconbtn" style={{ width: 30, height: 30 }} title="Upload image" onClick={() => fileRef.current?.click()}>
              <Icon n="image" size={18} />
            </button>
            <textarea rows={1} placeholder={'Ask for a change… e.g. “make the hook bolder”'}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className="send" disabled={!draft.trim() || busy} onClick={() => send()}>
              <Icon n="send" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
