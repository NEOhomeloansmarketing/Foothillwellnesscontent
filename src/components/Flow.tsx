'use client';
import { useState, useRef, useMemo } from 'react';
import Icon from './ui/Icon';
import Btn from './ui/Btn';
import { audiences, offerings } from '@/lib/brand';
import type { AudienceId, GoalId, GenerateOptions } from '@/types';

const GOALS = [
  { id: 'Awareness' as GoalId, label: 'Awareness', d: 'Get the right people to notice', ic: 'globe' },
  { id: 'Education' as GoalId, label: 'Educate', d: 'Explain a treatment simply', ic: 'pulse' },
  { id: 'New Guest Special' as GoalId, label: 'New Guest Special', d: 'Drive first visits', ic: 'target' },
  { id: 'Promotion' as GoalId, label: 'Promotion', d: 'Feature a package or offer', ic: 'sparkle' },
];

function flatServices() {
  const out: { cat: string; name: string }[] = [];
  offerings.forEach(g => g.items.forEach(name => out.push({ cat: g.cat, name })));
  return out;
}

interface FlowProps {
  onClose: () => void;
  onGenerate: (opts: GenerateOptions & { userImage?: string | null }) => void;
  contentType?: string;
}

export default function Flow({ onClose, onGenerate, contentType = 'ig-post' }: FlowProps) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<{ cat: string; name: string } | null>(null);
  const [audience, setAudience] = useState<AudienceId | null>(null);
  const [goal, setGoal] = useState<GoalId>('Awareness');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const photoRef = useRef<HTMLInputElement>(null);

  const services = useMemo(() => flatServices(), []);
  const filtered = q ? services.filter(s => (s.name + s.cat).toLowerCase().includes(q.toLowerCase())) : services;

  const canNext = [!!service, !!audience, true][step];
  const last = step === 2;

  function next() {
    if (last) {
      onGenerate({ contentType, service: service!.name, audience: audience!, goal, notes, userImage: photo });
    } else {
      setStep(step + 1);
    }
  }

  function onPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPhoto(r.result as string);
    r.readAsDataURL(f);
  }

  const audIcon: Record<AudienceId, string> = { pain: 'pulse', healing: 'shield', weight: 'target', energy: 'sparkle' };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="flow scrolly" onClick={e => e.stopPropagation()}>
        <div className="flow-head">
          <div className="flow-steps">
            {[0,1,2].map(i => <div key={i} className={`step-dot ${i < step ? 'done' : ''} ${i === step ? 'cur' : ''}`} />)}
          </div>
          <button className="iconbtn" onClick={onClose}><Icon n="close" size={18} /></button>
        </div>

        <div className="flow-body">
          {step === 0 && <>
            <div className="eyebrow q-eyebrow">{contentType === 'email' ? 'Email Campaign · Step 1 of 3' : 'Instagram Post · Step 1 of 3'}</div>
            <h3 className="serif">Which service are we highlighting?</h3>
            <p className="q-sub">Pick the one treatment this piece should feature. We'll lead with the client's problem first — never the treatment menu.</p>
            <div className="svc-search">
              <div className="hist-search" style={{ margin: 0 }}>
                <Icon n="search" size={16} />
                <input placeholder="Search services… (cryotherapy, semaglutide, IV…)" value={q} onChange={e => setQ(e.target.value)} autoFocus />
              </div>
              <div className="svc-list scrolly">
                {filtered.map((s, i) => (
                  <button key={i} className={`svc ${service?.name === s.name ? 'on' : ''}`} onClick={() => setService(s)}>
                    <div className="sc-cat">{s.cat}</div>
                    <div className="sc-name">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </>}

          {step === 1 && <>
            <div className="eyebrow q-eyebrow">{service?.name} · Step 2 of 3</div>
            <h3 className="serif">Who are we speaking to?</h3>
            <p className="q-sub">Lead with the pain they already feel. We'll match a real client testimonial to this audience automatically.</p>
            <div className="opt-grid two">
              {audiences.map(a => (
                <button key={a.id} className={`opt ${audience === a.id ? 'on' : ''}`} onClick={() => setAudience(a.id)}>
                  <div className="oic"><Icon n={audIcon[a.id]} size={20} /></div>
                  <div style={{ flex: 1 }}>
                    <div className="ot">{a.label}</div>
                    <div className="od">{a.problem}</div>
                  </div>
                </button>
              ))}
            </div>
          </>}

          {step === 2 && <>
            <div className="eyebrow q-eyebrow">{service?.name} · Step 3 of 3</div>
            <h3 className="serif">What's the goal & any details?</h3>
            <p className="q-sub">Set the intent, then add anything specific. The studio is where you'll refine it by chatting.</p>
            <div className="opt-grid two" style={{ marginBottom: 20 }}>
              {GOALS.map(g => (
                <button key={g.id} className={`opt ${goal === g.id ? 'on' : ''}`} onClick={() => setGoal(g.id)}>
                  <div className="oic"><Icon n={g.ic} size={20} /></div>
                  <div style={{ flex: 1 }}><div className="ot">{g.label}</div><div className="od">{g.d}</div></div>
                </button>
              ))}
            </div>
            <div className="field">
              <label>Tell the studio what you want <span style={{ textTransform: 'none', color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
              <textarea rows={3} placeholder="e.g. promote our buy-5-get-1 IV deal, feature Allie, keep it warm and local, lead with better sleep…" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            {contentType !== 'email' && (
              <div className="field" style={{ marginTop: 18 }}>
                <label>Use your own photo <span style={{ textTransform: 'none', color: 'var(--muted)', fontWeight: 400 }}>(optional — otherwise we'll auto-pick one)</span></label>
                <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} />
                {photo
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, border: '1.5px solid var(--line)', borderRadius: 12, background: '#fff' }}>
                      <img src={photo} style={{ width: 60, height: 60, borderRadius: 9, objectFit: 'cover' }} alt="" />
                      <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy-mid)' }}>Photo ready</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>The studio will place this in your graphic</div></div>
                      <button className="btn btn-quiet" style={{ fontSize: 12 }} onClick={() => { setPhoto(null); if (photoRef.current) photoRef.current.value = ''; }}>Remove</button>
                    </div>
                  : <button className="upl-btn" style={{ width: '100%', justifyContent: 'center', padding: '16px' }} onClick={() => photoRef.current?.click()}><Icon n="upload" size={17} /> Upload a photo to use</button>}
              </div>
            )}
          </>}
        </div>

        <div className="flow-foot">
          <button className="btn btn-quiet" onClick={() => step === 0 ? onClose() : setStep(step - 1)}>
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step === 0 && service && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{service.name} selected</span>}
            <Btn variant={canNext ? 'gold' : 'ghost'} disabled={!canNext} onClick={next} icon={last ? 'wand' : undefined} iconR={last ? undefined : 'chevR'}>
              {last ? 'Generate content' : 'Continue'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
