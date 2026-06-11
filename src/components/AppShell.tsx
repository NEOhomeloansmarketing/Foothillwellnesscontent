'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Icon from './ui/Icon';
import Btn from './ui/Btn';
import Home from './Home';
import Flow from './Flow';
import Studio from './Studio';
import Calendar from './Calendar';
import { useStore } from '@/store';
import { bakedGenerate } from '@/lib/content';
import { contentTypes } from '@/lib/brand';
import type { ContentPiece, GenerateOptions, EmailContent, FlyerContent } from '@/types';

export default function AppShell() {
  const {
    projects, current, view, flowOpen, generating, toast, postSuccess,
    setCurrent, setView, setFlowOpen, setGenerating, setToast, setPostSuccess,
    updateCurrent, updateProject, addProject,
  } = useStore();

  const [emailFlowOpen, setEmailFlowOpen] = useState(false);
  const [flyerFlowOpen, setFlyerFlowOpen] = useState(false);
  const toastT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function showToast(msg: string) {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 3400);
  }

  function pick(type: string) {
    if (type === 'library') { if (!current && projects.length) setCurrent(projects[0]); setView('studio'); return; }
    if (type === 'email') { setEmailFlowOpen(true); return; }
    if (type === 'flyer') { setFlyerFlowOpen(true); return; }
    if (type !== 'ig-post') {
      const ct = contentTypes.find(t => t.id === type);
      showToast((ct?.label || type) + ' is coming soon — Instagram Post is ready now');
      return;
    }
    setFlowOpen(true);
  }

  async function runGenerate(opts: GenerateOptions & { userImage?: string | null }) {
    setFlowOpen(false);
    setView('studio');           // switch immediately so overlay is visible
    setGenerating(true);

    setCurrent(null);

    const audienceShort: Record<string, string> = { pain: 'Pain', healing: 'Recovery', weight: 'Weight', energy: 'Energy' };
    const usedHooks = projects.filter(p => p.service === opts.service).map(p => p.graphic.hook);
    const usedProof = projects.filter(p => p.audience === opts.audience).map(p => p.proofUsed).filter(Boolean);
    let content = bakedGenerate({ ...opts, usedHooks, usedProof });

    if (usedHooks.length) {
      setTimeout(() => showToast(`Steering away from ${usedHooks.length} past hook${usedHooks.length > 1 ? 's' : ''} for ${opts.service}`), 1000);
    }

    function fetchWithTimeout(url: string, init: RequestInit, ms: number) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ms);
      return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(timer));
    }

    // Step 1: Generate text first so we can pass the hook to DALL-E for a relevant image
    let hook = '';
    let subhook = '';
    try {
      const textRes = await fetchWithTimeout('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: opts.service, audience: opts.audience, goal: opts.goal, notes: opts.notes, usedHooks, proofUsed: content.proofUsed }),
      }, 38000);
      const json = await textRes.json();
      if (json.ok && json.data) {
        const d = json.data;
        hook = d.hook || '';
        subhook = d.subhook || '';
        content = {
          ...content,
          graphic: { ...content.graphic, hook: d.hook || content.graphic.hook, emphasis: d.emphasis || content.graphic.emphasis, subhook: d.subhook || content.graphic.subhook },
          caption: d.caption || content.caption,
          hashtags: d.hashtags?.length ? d.hashtags : content.hashtags,
        };
      }
    } catch { /* use baked content */ }

    // Open Studio immediately — image will load in background
    if (opts.userImage) {
      (content as { autoImage: string | string[] }).autoImage = opts.userImage;
    }

    const projId = 'p' + Math.random().toString(36).slice(2, 8);
    const proj: ContentPiece = {
      id: projId,
      createdAt: Date.now(),
      channels: [],
      status: 'draft',
      title: `${opts.service} · ${audienceShort[opts.audience]}`,
      ...content,
    };

    addProject(proj);
    setGenerating(false);

    // Step 2: kick off DALL-E in background with the actual hook so the image matches the post
    if (!opts.userImage) {
      fetchWithTimeout('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: opts.service, audience: opts.audience, hook, subhook }),
      }, 65000)
        .then(r => r.json())
        .then(json => { if (json.ok && json.dataUrl) updateProject({ ...proj, autoImage: json.dataUrl }); })
        .catch(() => {});
    }
  }

  async function runGenerateEmail(opts: GenerateOptions) {
    setEmailFlowOpen(false);
    setView('studio');
    setGenerating(true);
    setCurrent(null);

    const audienceShort: Record<string, string> = { pain: 'Pain', healing: 'Recovery', weight: 'Weight', energy: 'Energy' };
    const projId = 'p' + Math.random().toString(36).slice(2, 8);

    const placeholderEmail: EmailContent = {
      subject: 'Writing your email…',
      previewText: '',
      opening: '',
      empathy: '',
      explanation: '',
      proof: '',
      speed: '',
      ease: '',
      cta: 'Call or text (801) 784-0095',
      closing: 'Foothill Wellness Team',
    };

    const proj: ContentPiece = {
      id: projId,
      createdAt: Date.now(),
      channels: [],
      status: 'draft',
      contentType: 'email',
      title: `${opts.service} · Email · ${audienceShort[opts.audience] ?? opts.audience}`,
      service: opts.service,
      audience: opts.audience,
      goal: opts.goal,
      template: 'educate',
      graphic: { eyebrow: '', hook: '', emphasis: '', subhook: '', ctaShort: '', quote: '', proofName: '', proofMeta: '', title: '', tagline: '', problemHook: '', problemEmphasis: '', problemDesc: '', aspiration: '', benefits: [], speed: '' },
      caption: '',
      hashtags: [],
      fiveLaws: [],
      autoImage: null,
      imgKeywords: '',
      altHooks: [],
      proofUsed: '',
      emailContent: placeholderEmail,
    };

    addProject(proj);
    setGenerating(false);

    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: opts.service, audience: opts.audience, goal: opts.goal, notes: opts.notes }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        updateProject({ ...proj, emailContent: json.data as EmailContent });
      } else {
        showToast('Email generation failed — try again');
      }
    } catch {
      showToast('Network error generating email');
    }
  }

  async function runGenerateFlyer(opts: GenerateOptions) {
    setFlyerFlowOpen(false);
    setView('studio');
    setGenerating(true);
    setCurrent(null);

    const audienceShort: Record<string, string> = { pain: 'Pain', healing: 'Recovery', weight: 'Weight', energy: 'Energy' };
    const projId = 'p' + Math.random().toString(36).slice(2, 8);

    const placeholderFlyer: FlyerContent = {
      template: 'split',
      headline: 'LOADING…',
      subheadline: '',
      description: '',
      benefits: [],
      stats: [],
      tagline: 'Feel Better Faster',
      cta: '(801) 784-0095',
    };

    const proj: ContentPiece = {
      id: projId,
      createdAt: Date.now(),
      channels: [],
      status: 'draft',
      contentType: 'flyer',
      title: `${opts.service} · Flyer${opts.audience ? ' · ' + (audienceShort[opts.audience] ?? opts.audience) : ''}`,
      service: opts.service,
      audience: opts.audience,
      goal: opts.goal,
      template: 'educate',
      graphic: { eyebrow: '', hook: '', emphasis: '', subhook: '', ctaShort: '', quote: '', proofName: '', proofMeta: '', title: '', tagline: '', problemHook: '', problemEmphasis: '', problemDesc: '', aspiration: '', benefits: [], speed: '' },
      caption: '',
      hashtags: [],
      fiveLaws: [],
      autoImage: null,
      imgKeywords: '',
      altHooks: [],
      proofUsed: '',
      flyerContent: placeholderFlyer,
    };

    addProject(proj);
    setGenerating(false);

    try {
      const res = await fetch('/api/generate-flyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: opts.service, audience: opts.audience, goal: opts.goal, notes: opts.notes }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        updateProject({ ...proj, flyerContent: { ...json.data, template: 'split' } as FlyerContent });
      } else {
        showToast('Flyer generation failed — try again');
      }
    } catch {
      showToast('Network error generating flyer');
    }
  }

  function openProject(p: ContentPiece) {
    setCurrent(p);
    setView('studio');
  }

  return (
    <div className="app">
      <div className="topbar">
        <button className="brand" onClick={() => setView('home')} style={{ background: 'none' }}>
          <Image src="/foothill-logo.png" alt="Foothill Wellness" width={120} height={34} style={{ objectFit: 'contain', height: 34, width: 'auto' }} />
          <span className="brandname">Content Studio<small>Foothill Wellness</small></span>
        </button>
        <div className="topnav">
          <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>Create</button>
          <button className={view === 'studio' ? 'active' : ''} onClick={() => { setCurrent(current || projects[0] || null); setView('studio'); }}>Library</button>
          <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>Calendar</button>
        </div>
        <div className="spacer" />
        <button className="iconbtn" onClick={() => showToast('All caught up — no new alerts')}><Icon n="bell" size={18} /></button>
        <Btn variant="gold" icon="plus" onClick={() => pick('ig-post')}>New Post</Btn>
        <div className="avatar" title="Foothill Wellness">FW</div>
      </div>

      {view === 'home' && <Home projects={projects} onPick={pick} onOpen={openProject} />}
      {view === 'calendar' && <Calendar projects={projects} onOpen={openProject} />}
      {(view === 'studio' || generating) && (
        <Studio
          projects={projects}
          current={current}
          generating={generating}
          onSelect={setCurrent}
          onUpdate={updateCurrent}
          onSave={updateCurrent}
          onPick={pick}
          onToast={showToast}
          onPosted={(p) => { updateCurrent(p); setPostSuccess(true); }}
        />
      )}

      {flowOpen && <Flow onClose={() => setFlowOpen(false)} onGenerate={runGenerate} />}
      {emailFlowOpen && <Flow contentType="email" onClose={() => setEmailFlowOpen(false)} onGenerate={runGenerateEmail} />}
      {flyerFlowOpen && <Flow contentType="flyer" onClose={() => setFlyerFlowOpen(false)} onGenerate={runGenerateFlyer} />}

      {postSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(1,24,54,0.92)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 28, padding: '56px 72px',
            textAlign: 'center', boxShadow: '0 40px 120px rgba(1,24,54,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
            maxWidth: 480, width: '100%',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#dcfce7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon n="check" size={40} style={{ color: '#16a34a' }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 800, color: 'var(--navy-deep)', lineHeight: 1.2 }}>
              Posted to Instagram!
            </div>
            <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6 }}>
              Your post is on its way to Instagram via Zapier.
            </div>
            <button
              onClick={() => { setPostSuccess(false); setView('home'); }}
              style={{
                marginTop: 8, background: 'var(--navy-deep)', color: 'var(--gold-cta)',
                border: 'none', borderRadius: 14, padding: '16px 40px',
                fontSize: 16, fontWeight: 800, cursor: 'pointer', letterSpacing: '.04em',
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span className="ti"><Icon n="check" size={17} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}
