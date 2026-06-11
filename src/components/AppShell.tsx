'use client';
import { useRef } from 'react';
import Image from 'next/image';
import Icon from './ui/Icon';
import Btn from './ui/Btn';
import Home from './Home';
import Flow from './Flow';
import Studio from './Studio';
import { useStore } from '@/store';
import { bakedGenerate } from '@/lib/content';
import { contentTypes } from '@/lib/brand';
import type { ContentPiece, GenerateOptions } from '@/types';

export default function AppShell() {
  const {
    projects, current, view, flowOpen, generating, toast,
    setCurrent, setView, setFlowOpen, setGenerating, setToast,
    updateCurrent, addProject,
  } = useStore();

  const toastT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function showToast(msg: string) {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 3400);
  }

  function pick(type: string) {
    if (type === 'library') { setView('studio'); return; }
    if (type !== 'ig-post') {
      const ct = contentTypes.find(t => t.id === type);
      showToast((ct?.label || type) + ' is coming soon — Instagram Post is ready now');
      return;
    }
    setFlowOpen(true);
  }

  async function runGenerate(opts: GenerateOptions & { userImage?: string | null }) {
    setFlowOpen(false);
    setView('studio');
    setGenerating(true);
    setCurrent(null);

    const audienceShort: Record<string, string> = { pain: 'Pain', healing: 'Recovery', weight: 'Weight', energy: 'Energy' };

    // bakedGenerate always succeeds — this is our guaranteed fallback content
    const usedHooks = projects.filter(p => p.service === opts.service).map(p => p.graphic.hook);
    const usedProof = projects.filter(p => p.audience === opts.audience).map(p => p.proofUsed).filter(Boolean);
    let content = bakedGenerate({ ...opts, usedHooks, usedProof });
    let aiImageUrl: string | null = null;

    if (usedHooks.length) {
      setTimeout(() => showToast(`Steering away from ${usedHooks.length} past hook${usedHooks.length > 1 ? 's' : ''} for ${opts.service}`), 1000);
    }

    try {
      const minWait = new Promise(r => setTimeout(r, 4800));

      // Helper: fetch with a hard timeout so Promise.all never hangs
      function fetchWithTimeout(url: string, init: RequestInit, ms: number) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), ms);
        return fetch(url, { ...init, signal: ctrl.signal })
          .finally(() => clearTimeout(timer));
      }

      const textPromise = fetchWithTimeout('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: opts.service, audience: opts.audience, goal: opts.goal, notes: opts.notes, usedHooks }),
      }, 30000).then(r => r.json()).then(json => {
        if (json.ok && json.data) {
          const d = json.data;
          content = {
            ...content,
            graphic: { ...content.graphic, hook: d.hook || content.graphic.hook, emphasis: d.emphasis || content.graphic.emphasis, subhook: d.subhook || content.graphic.subhook },
            caption: d.caption || content.caption,
            hashtags: d.hashtags?.length ? d.hashtags : content.hashtags,
          };
        }
      }).catch(() => {});

      const imagePromise = opts.userImage ? Promise.resolve() : fetchWithTimeout('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: opts.service, audience: opts.audience }),
      }, 58000).then(r => r.json()).then(json => {
        if (json.ok && json.dataUrl) aiImageUrl = json.dataUrl;
      }).catch(() => {});

      await Promise.all([minWait, textPromise, imagePromise]);
    } catch (e) {
      console.error('Generation API error (using baked fallback):', e);
    }

    // Always land in Studio with content — baked content is the guaranteed fallback
    if (opts.userImage) {
      (content as { autoImage: string | string[] }).autoImage = opts.userImage;
    } else if (aiImageUrl) {
      (content as { autoImage: string }).autoImage = aiImageUrl;
    }

    const proj: ContentPiece = {
      id: 'p' + Math.random().toString(36).slice(2, 8),
      createdAt: Date.now(),
      channels: [],
      status: 'draft',
      title: `${opts.service} · ${audienceShort[opts.audience]}`,
      ...content,
    };

    addProject(proj);
    setView('studio');   // re-assert in case anything reset it during the async wait
    setGenerating(false);
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
          <button onClick={() => showToast('Calendar view — connect accounts to schedule')}>Calendar</button>
        </div>
        <div className="spacer" />
        <button className="iconbtn" onClick={() => showToast('All caught up — no new alerts')}><Icon n="bell" size={18} /></button>
        <Btn variant="gold" icon="plus" onClick={() => pick('ig-post')}>New Post</Btn>
        <div className="avatar" title="Foothill Wellness">FW</div>
      </div>

      {view === 'home'
        ? <Home projects={projects} onPick={pick} onOpen={openProject} />
        : <Studio
            projects={projects}
            current={current}
            generating={generating}
            onSelect={setCurrent}
            onUpdate={updateCurrent}
            onSave={updateCurrent}
            onPick={pick}
            onToast={showToast}
          />}

      {flowOpen && <Flow onClose={() => setFlowOpen(false)} onGenerate={runGenerate} />}

      {toast && (
        <div className="toast">
          <span className="ti"><Icon n="check" size={17} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}
