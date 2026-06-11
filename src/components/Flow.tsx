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
  // Event-specific fields
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  const isEvent = service?.name === 'Event';
  const isCustom = service?.name === 'Custom';
  const [customTopic, setCustomTopic] = useState('');
  const [customDetails, setCustomDetails] = useState('');

  const services = useMemo(() => flatServices(), []);
  const filtered = q ? services.filter(s => (s.name + s.cat).toLowerCase().includes(q.toLowerCase())) : services;

  const skipAudience = isEvent || isCustom;
  const canNext = [!!service, skipAudience || !!audience, isCustom ? !!customTopic : isEvent ? !!eventName : true][step];
  const last = step === 2;

  function next() {
    if (last) {
      let finalNotes = notes;
      if (isEvent) {
        const parts = [
          eventName && `Event: ${eventName}`,
          eventDate && `Date: ${eventDate}`,
          eventTime && `Time: ${eventTime}`,
          eventLocation && `Location: ${eventLocation}`,
          eventDesc && `Details: ${eventDesc}`,
          notes && notes,
        ].filter(Boolean);
        finalNotes = parts.join(' | ');
      }
      if (isCustom) {
        const parts = [
          customTopic && `Topic: ${customTopic}`,
          customDetails && `Details: ${customDetails}`,
          notes && notes,
        ].filter(Boolean);
        finalNotes = parts.join(' | ');
      }
      onGenerate({ contentType, service: isCustom ? (customTopic || 'Custom') : service!.name, audience: audience!, goal, notes: finalNotes, userImage: photo });
    } else {
      // skip audience step for Event/Custom
      setStep(step === 0 && skipAudience ? 2 : step + 1);
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

            {/* Special shortcuts */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                className={`svc ${service?.name === 'Event' ? 'on' : ''}`}
                onClick={() => setService({ cat: 'Special', name: 'Event' })}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}
              >
                <div style={{ fontSize: 18 }}>📅</div>
                <div>
                  <div className="sc-cat">Special</div>
                  <div className="sc-name">Event</div>
                </div>
              </button>
              <button
                className={`svc ${service?.name === 'Custom' ? 'on' : ''}`}
                onClick={() => setService({ cat: 'Special', name: 'Custom' })}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}
              >
                <div style={{ fontSize: 18 }}>✏️</div>
                <div>
                  <div className="sc-cat">Special</div>
                  <div className="sc-name">Custom</div>
                </div>
              </button>
            </div>

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
            {isCustom && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)' }}>Custom Topic</div>
                <div className="field" style={{ margin: 0 }}>
                  <label>What's this about? <span style={{ textTransform: 'none', color: 'var(--red, #e55)', fontWeight: 400 }}>*</span></label>
                  <input placeholder="e.g. New staff member, holiday hours, a personal story…" value={customTopic} onChange={e => setCustomTopic(e.target.value)} autoFocus />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Details <span style={{ textTransform: 'none', color: 'var(--muted)', fontWeight: 400 }}>(the more you add, the better the output)</span></label>
                  <textarea rows={4} placeholder="Paste in key points, talking points, offers, or anything else you want included…" value={customDetails} onChange={e => setCustomDetails(e.target.value)} />
                </div>
              </div>
            )}
            {isEvent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-muted)' }}>Event Details</div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Event name <span style={{ textTransform: 'none', color: 'var(--red, #e55)', fontWeight: 400 }}>*</span></label>
                  <input placeholder="e.g. Wellness Wednesday Open House" value={eventName} onChange={e => setEventName(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Date</label>
                    <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Time</label>
                    <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} />
                  </div>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Location <span style={{ textTransform: 'none', color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input placeholder="e.g. Foothill Wellness, 1414 S Foothill Dr" value={eventLocation} onChange={e => setEventLocation(e.target.value)} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>What's happening / any offers</label>
                  <textarea rows={2} placeholder="e.g. Free 15-min cryo demo, 20% off packages, meet the team…" value={eventDesc} onChange={e => setEventDesc(e.target.value)} />
                </div>
              </div>
            )}
            <div className="field">
              <label>{isEvent ? 'Anything else to add' : 'Tell the studio what you want'} <span style={{ textTransform: 'none', color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
              <textarea rows={3} placeholder={isEvent ? 'e.g. keep it exciting, urgency on limited spots…' : 'e.g. promote our buy-5-get-1 IV deal, feature Allie, keep it warm and local, lead with better sleep…'} value={notes} onChange={e => setNotes(e.target.value)} />
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
          <button className="btn btn-quiet" onClick={() => step === 0 ? onClose() : setStep(step === 2 && skipAudience ? 0 : step - 1)}>
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
