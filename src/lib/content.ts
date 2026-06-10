import { offerings, testimonials } from './brand';
import type { AudienceId, GoalId, ContentPiece, FiveLaw, GenerateOptions, TemplateId, ChannelId, StatusType } from '@/types';

export const AUD: Record<AudienceId, string> = {
  pain: 'Pain & Inflammation',
  healing: 'Healing & Recovery',
  weight: 'Weight & Body',
  energy: 'Energy & Vitality',
};

const HOOKS: Record<AudienceId, [string, string][]> = {
  pain: [
    ["Your back has been running the show.", "running the show"],
    ["Pain shouldn't get the final say.", "final say"],
    ["Stiff every morning? That's not just \"your age.\"", "age"],
    ["You've been managing pain. Let's work on relief.", "relief"],
    ["Chronic pain is exhausting. You deserve more than just managing it.", "managing it"],
  ],
  healing: [
    ["Surgery slowed you down. Healing doesn't have to crawl.", "crawl"],
    ["Your recovery has a faster lane.", "faster"],
    ["Give your body what it needs to bounce back.", "bounce back"],
    ["Heal like your comeback depends on it.", "comeback"],
    ["You were active before. Let's get you back there.", "back there"],
  ],
  weight: [
    ["You've tried willpower. Let's try a plan that works.", "works"],
    ["The scale isn't the whole story.", "whole story"],
    ["Get back to the body that keeps up with your life.", "keeps up"],
    ["Lose the weight without white-knuckling it.", "white-knuckling"],
    ["Your body isn't broken. It just needs the right support.", "right support"],
  ],
  energy: [
    ["Tired of being tired.", "tired"],
    ["You used to have a spark. Let's get it back.", "spark"],
    ["Running on empty isn't a personality trait.", "empty"],
    ["Feel like yourself again.", "yourself"],
    ["If you've felt off, there's a reason — and a path back.", "path back"],
  ],
};

const SUBHOOK: Record<AudienceId, string> = {
  pain: "may help calm inflammation and ease the discomfort that's been limiting you — so you can move through your day without negotiating with your body.",
  healing: "is designed to support your body's natural repair process, so recovery feels less like waiting and more like progress.",
  weight: "pairs medical guidance with real accountability — a plan built around your body, not another crash diet.",
  energy: "can help restore the energy, focus, and steadiness you've been missing — so you feel more like you again.",
};

const EYEBROW: Record<AudienceId, string> = {
  pain: 'PAIN RELIEF · SALT LAKE CITY',
  healing: 'RECOVERY · SALT LAKE CITY',
  weight: 'MEDICAL WEIGHT LOSS · SLC',
  energy: 'ENERGY & WELLNESS · SLC',
};

const PROBLEM: Record<AudienceId, [string, string, string]> = {
  pain: ['Stiff, sore, or aching more than you should be?', 'aching', 'Pain, tension, and inflammation can pile up — leaving you stiff, limited, and slower than you want to be.'],
  healing: ['Healing slower than you want to be?', 'slower', 'Injury, surgery, and strain can stall recovery — leaving you sidelined longer than you should be.'],
  weight: ['Tired of fighting your body and the scale?', 'fighting', 'Stubborn weight, low energy, and frustration build up — leaving you feeling stuck and discouraged.'],
  energy: ['Feeling stressed, drained, or just off?', 'drained', 'Toxins, tension, and inflammation can build up — leaving you fatigued, achy, and stuck.'],
};

const BENEFITS_FALLBACK: Record<AudienceId, [string, string][]> = {
  pain: [['flame','Calm inflammation'],['dumbbell','Ease aches & stiffness'],['heart','Support natural healing'],['bolt','Move with more freedom'],['lotus','Feel more like yourself']],
  healing: [['heart','Support natural healing'],['dumbbell','Recover faster'],['drop','Reduce inflammation'],['bolt','Restore energy'],['lotus','Get back to life']],
  weight: [['target','Support steady weight loss'],['dumbbell','Preserve lean muscle'],['bolt','Boost energy & metabolism'],['heart','Build lasting habits'],['lotus','Feel confident again']],
  energy: [['bolt','Restore natural energy'],['drop','Rehydrate & replenish'],['lotus','Lower stress'],['moon','Improve sleep'],['heart','Feel like yourself again']],
};

interface ServiceInfo {
  title: string;
  tagline: string;
  img: string;
  speed: string;
  benefits: [string, string][];
}

export const SERVICE_INFO: Record<string, ServiceInfo> = {
  'Infrared Sauna': {
    title: 'INFRARED SAUNA', tagline: 'Deep Heat. Real Relief.', img: 'sauna',
    speed: 'Just 30–45 minutes can make a difference.',
    benefits: [['drop','Detoxify & support cellular health'],['dumbbell','Soothe sore muscles & joints'],['lotus','Reduce stress & improve sleep'],['flame','Boost circulation & metabolism'],['bolt','Increase energy naturally']],
  },
  'Cryotherapy': {
    title: 'WHOLE-BODY CRYOTHERAPY', tagline: 'Cold Therapy. Fast Recovery.', img: 'spa,recovery',
    speed: 'Just 3 minutes — and you feel the difference immediately.',
    benefits: [['flame','Calm inflammation & swelling'],['dumbbell','Speed muscle recovery'],['bolt','Boost energy & mood'],['heart','Support metabolism'],['moon','Sharpen focus & sleep']],
  },
  'Red Light Therapy': {
    title: 'RED LIGHT THERAPY', tagline: 'Light That Heals.', img: 'spa,skincare',
    speed: 'Sessions take just 15 minutes.',
    benefits: [['heart','Support skin & collagen'],['dumbbell','Ease joint & muscle pain'],['drop','Reduce inflammation'],['bolt','Improve energy & recovery'],['lotus','Calm the nervous system']],
  },
  'Compression Therapy': {
    title: 'COMPRESSION THERAPY', tagline: 'Move Freely Again.', img: 'athlete,recovery',
    speed: 'Relax for 20–30 minutes and reset.',
    benefits: [['drop','Flush out fluid & toxins'],['dumbbell','Speed muscle recovery'],['heart','Improve circulation'],['lotus','Relieve heavy, tired legs'],['bolt','Bounce back faster']],
  },
  'HBOT / mHBOT': {
    title: 'HYPERBARIC OXYGEN', tagline: 'Oxygen. Accelerated Healing.', img: 'wellness,clinic',
    speed: 'Relax while your body does the work.',
    benefits: [['drop','Flood tissues with oxygen'],['dumbbell','Support recovery after surgery'],['flame','Reduce inflammation'],['bolt','Boost energy & clarity'],['heart','Support natural healing']],
  },
  'IV Drip Therapy': {
    title: 'IV THERAPY', tagline: 'Hydrate. Restore. Thrive.', img: 'wellness,clinic',
    speed: 'Feel the difference in under an hour.',
    benefits: [['drop','Rehydrate at the cellular level'],['bolt','Restore energy fast'],['heart','Support immunity'],['lotus','Ease stress & recovery'],['flame','Replenish key nutrients']],
  },
  'IV Infusions': {
    title: 'IV INFUSIONS', tagline: 'Restore From the Inside.', img: 'wellness,clinic',
    speed: 'Feel the difference in under an hour.',
    benefits: [['drop','Rehydrate at the cellular level'],['bolt','Restore energy fast'],['heart','Support immunity'],['lotus','Ease stress & recovery'],['flame','Replenish key nutrients']],
  },
  'NAD+ IV': {
    title: 'NAD+ THERAPY', tagline: 'Cellular Energy, Restored.', img: 'wellness,spa',
    speed: 'A reset you can feel within days.',
    benefits: [['bolt','Restore cellular energy'],['lotus','Support mental clarity'],['heart','Promote healthy aging'],['drop','Aid recovery & repair'],['flame','Boost metabolism']],
  },
  'NAD+ IM': {
    title: 'NAD+ THERAPY', tagline: 'Cellular Energy, Restored.', img: 'wellness,spa',
    speed: 'A reset you can feel within days.',
    benefits: [['bolt','Restore cellular energy'],['lotus','Support mental clarity'],['heart','Promote healthy aging'],['drop','Aid recovery & repair'],['flame','Boost metabolism']],
  },
  'Semaglutide': {
    title: 'MEDICAL WEIGHT LOSS', tagline: 'Real Results. Real Support.', img: 'fitness,healthy,lifestyle,wellness',
    speed: 'Many clients report progress within weeks.',
    benefits: [['target','Curb cravings & appetite'],['dumbbell','Preserve lean muscle'],['bolt','Boost energy & metabolism'],['heart','Medically guided & monitored'],['lotus','Feel confident again']],
  },
  'Tirzepatide': {
    title: 'MEDICAL WEIGHT LOSS', tagline: 'Real Results. Real Support.', img: 'fitness,healthy,lifestyle,wellness',
    speed: 'Many clients report progress within weeks.',
    benefits: [['target','Curb cravings & appetite'],['dumbbell','Preserve lean muscle'],['bolt','Boost energy & metabolism'],['heart','Medically guided & monitored'],['lotus','Feel confident again']],
  },
  'Microneedling': {
    title: 'MICRONEEDLING', tagline: 'Skin That Speaks for Itself.', img: 'skincare,spa',
    speed: 'Most clients see improvement after just one session.',
    benefits: [['heart','Stimulate collagen production'],['lotus','Smooth fine lines & texture'],['drop','Improve skin tone'],['bolt','Minimal downtime'],['flame','Reveal fresher skin']],
  },
  'Facials': {
    title: 'SIGNATURE FACIALS', tagline: 'Glow. Renewed.', img: 'facial,spa,skincare',
    speed: '60 minutes to visibly better skin.',
    benefits: [['heart','Deep cleanse & hydrate'],['lotus','Calm redness & irritation'],['drop','Brighten & even tone'],['bolt','Relax & restore'],['flame','Leave glowing']],
  },
  'Botox': {
    title: 'BOTOX', tagline: 'Refresh. Naturally.', img: 'aesthetic,beauty',
    speed: 'Results visible within days.',
    benefits: [['heart','Smooth expression lines'],['lotus','Look refreshed, not frozen'],['drop','Quick 15-minute treatment'],['bolt','No downtime'],['flame','Long-lasting results']],
  },
  'Dermal Fillers': {
    title: 'DERMAL FILLERS', tagline: 'Restore. Naturally.', img: 'aesthetic,beauty',
    speed: 'Walk in and walk out looking refreshed.',
    benefits: [['heart','Restore lost volume'],['lotus','Enhance natural contours'],['drop','Smooth deep lines'],['bolt','Instant results'],['flame','Natural-looking lift']],
  },
  'Emsculpt Neo': {
    title: 'EMSCULPT NEO', tagline: 'Build Muscle. Burn Fat.', img: 'fitness,body',
    speed: 'Equivalent to 20,000 muscle contractions in 30 minutes.',
    benefits: [['dumbbell','Build & tone muscle'],['target','Reduce stubborn fat'],['bolt','No surgery, no downtime'],['heart','Clinically proven results'],['lotus','Feel stronger & more confident']],
  },
};

function pick<T>(arr: T[], seed: number): T { return arr[Math.abs(seed) % arr.length]; }
function hashStr(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

// Smart testimonial matching: service-specific first, then audience-tagged fallback
function matchTestimonial(service: string, audience: AudienceId, used: string[]) {
  // 1. Try to find testimonials that specifically mention this service
  const byService = testimonials.filter(t => t.services?.includes(service));
  const freshByService = byService.filter(t => !used.includes(t.name));
  if (freshByService.length) return freshByService[Math.floor(Math.random() * freshByService.length)];
  if (byService.length) return byService[Math.floor(Math.random() * byService.length)];

  // 2. Fall back to audience-matched testimonials
  const byAudience = testimonials.filter(t => t.tag === audience);
  const freshByAudience = byAudience.filter(t => !used.includes(t.name));
  if (freshByAudience.length) return freshByAudience[Math.floor(Math.random() * freshByAudience.length)];
  if (byAudience.length) return byAudience[Math.floor(Math.random() * byAudience.length)];

  return testimonials[0];
}

// Curated Unsplash photo IDs by wellness theme
const UNSPLASH_POOL: Record<string, string[]> = {
  sauna: ['1540555700478-4be289fbecef', '1556742049-0cfed4f6a45d', '1573883431205-98b5f615d6f8'],
  cryo: ['1571019613454-1cb2f99b2d8b', '1515377905703-c4788e51af15', '1544161515-4ab6ce6db874'],
  'red-light': ['1559757148-5c350d0d3c56', '1512621776951-a57141f2eefd', '1570172619644-dfd03ed5d881'],
  iv: ['1576091160399-112ba8d25d1d', '1559757175-5700dde675bc', '1571019613454-1cb2f99b2d8b'],
  nad: ['1559757175-5700dde675bc', '1516975080664-ed2fc6a32937', '1576091160550-2173dba999ef'],
  weight: ['1571019614242-c5c5dee9f50b', '1476480221304-6b5574f8d8e5', '1518611012118-696072aa579a'],
  pain: ['1544161515-4ab6ce6db874', '1506126613408-eca07ce68773', '1600334129128-685c5582fd35'],
  healing: ['1571019614242-c5c5dee9f50b', '1559757175-5700dde675bc', '1600585154340-be6161a56a0c'],
  energy: ['1519823551278-64ac92734fb1', '1571019613454-1cb2f99b2d8b', '1559757148-5c350d0d3c56'],
  aesthetics: ['1570172619644-dfd03ed5d881', '1512621776951-a57141f2eefd', '1559757148-5c350d0d3c56'],
  general: ['1571019613454-1cb2f99b2d8b', '1506126613408-eca07ce68773', '1515377905703-c4788e51af15', '1544161515-4ab6ce6db874'],
};

const KW_TO_KEY: Record<string, string> = {
  sauna: 'sauna', 'spa,recovery': 'healing', 'spa,skincare': 'aesthetics', 'athlete,recovery': 'healing',
  'wellness,clinic': 'iv', 'wellness,spa': 'nad', 'fitness,healthy,lifestyle,wellness': 'weight',
  'wellness,massage': 'pain', 'skincare,spa': 'aesthetics', 'facial,spa,skincare': 'aesthetics',
  'aesthetic,beauty': 'aesthetics', 'fitness,body': 'weight', general: 'general',
};

const AUD_KEY: Record<AudienceId, string> = {
  pain: 'pain', healing: 'healing', weight: 'weight', energy: 'energy',
};

export function aiImageFor(keywords: string, seed: number, audience?: AudienceId): string[] {
  const kw = (keywords || 'general').trim();
  const poolKey = KW_TO_KEY[kw] || (audience ? AUD_KEY[audience] : 'general');
  const pool = UNSPLASH_POOL[poolKey] || UNSPLASH_POOL.general;
  const idx = Math.abs(seed || Date.now()) % pool.length;
  const ordered = [pool[idx], ...pool.filter((_, i) => i !== idx)];
  return ordered.map(id => `https://images.unsplash.com/photo-${id}?w=1080&h=1080&fit=crop&crop=entropy&auto=format&q=80`);
}

export function flatServices() {
  const out: { cat: string; name: string }[] = [];
  offerings.forEach(g => g.items.forEach(name => out.push({ cat: g.cat, name })));
  return out;
}

export function bakedGenerate(opts: GenerateOptions): Omit<ContentPiece, 'id' | 'createdAt' | 'title' | 'channels' | 'status'> {
  const { service, audience, goal, usedHooks = [], usedProof = [] } = opts;
  const seed = hashStr(service + audience + goal + Date.now());
  const hookPool = HOOKS[audience] || HOOKS.energy;
  const freshHooks = hookPool.filter(h => !usedHooks.includes(h[0]));
  const [hook, emphasis] = pick(freshHooks.length ? freshHooks : hookPool, seed);
  const t = matchTestimonial(service, audience, usedProof);
  const eyebrow = EYEBROW[audience];
  const subhook = `${service} ${SUBHOOK[audience]}`;
  const goalLine =
    goal === 'New Guest Special'
      ? `New here? Your New Guest Special is the easiest first step — no commitment, just a conversation.`
      : goal === 'Promotion'
      ? `Right now is a great time to start.`
      : `Your first visit is simple: we listen first, then guide you to the right starting point.`;

  const caption =
    `${hook}\n\n` +
    `If that's you, you're not imagining it — and you don't have to figure it out alone. ${subhook[0].toUpperCase() + subhook.slice(1)}\n\n` +
    `Here's how we start: we listen first, understand your goals, and guide you to the right next step. No pressure, no treatment menu thrown at you.\n\n` +
    `"${t.text}" — ${t.name}, real Foothill client\n\n` +
    `Most clients feel a difference sooner than they expect. ${goalLine}\n\n` +
    `👇 Ready to feel better faster?\nCall or text (801) 784-0095 · Foothill Wellness, Salt Lake City`;

  const hashtags = [
    '#FeelBetterFaster', '#FoothillWellness', '#SaltLakeCity', '#SLCwellness',
    audience === 'pain' ? '#PainRelief' : audience === 'healing' ? '#RecoveryMode' : audience === 'weight' ? '#MedicalWeightLoss' : '#EnergyBoost',
    '#' + service.replace(/[^a-z]/gi, ''), '#WellnessSLC', '#HealNaturally',
  ];

  const fiveLaws: FiveLaw[] = [
    { law: 'It is not about you', score: 5, note: `Opens on the client's problem and uses "you," not "we."` },
    { law: 'Lead with their problem', score: 5, note: `Hook names ${AUD[audience].toLowerCase()} the reader already feels.` },
    { law: 'Perceived likelihood', score: t ? 5 : 4, note: t ? `Real testimonial from ${t.name} who mentions ${service} specifically.` : `Could use a client proof point.` },
    { law: 'Perceived speed', score: 4, note: `"Sooner than you expect" implies speed; could add a concrete timeframe.` },
    { law: 'Perceived ease', score: 5, note: `First step framed as a low-friction call/text — no commitment.` },
  ];

  const info = SERVICE_INFO[service] || {} as Partial<ServiceInfo>;
  const imgKeywords = info.img || 'general';
  const [phook, pemph, pdesc] = PROBLEM[audience] || PROBLEM.energy;
  const benefits: [string, string][] = (info.benefits || BENEFITS_FALLBACK[audience] || BENEFITS_FALLBACK.energy) as [string, string][];

  const proofMeta: Record<AudienceId, string> = {
    pain: 'Chronic pain relief client',
    healing: 'Post-surgery recovery client',
    weight: 'Medical weight-loss client',
    energy: 'Energy & wellness client',
  };

  const rawQuote = t.text.length > 170 ? t.text.slice(0, 168).replace(/\s+\S*$/, '') + '…' : t.text;
  const quote = `"${rawQuote}"`;

  return {
    contentType: 'ig-post', service, audience, goal,
    template: ((opts as GenerateOptions & { template?: TemplateId }).template || 'educate') as TemplateId,
    autoImage: aiImageFor(imgKeywords, seed, audience),
    imgKeywords,
    graphic: {
      eyebrow, hook, emphasis, subhook, ctaShort: '(801) 784-0095',
      quote, proofName: t.name, proofMeta: proofMeta[audience],
      title: info.title || service.toUpperCase(),
      tagline: info.tagline || 'Feel Better. Faster.',
      problemHook: phook, problemEmphasis: pemph, problemDesc: pdesc,
      aspiration: 'You deserve more energy, better recovery, and a body that feels like yours again.',
      benefits,
      speed: info.speed || 'Just one session can make a difference.',
    },
    caption, hashtags, fiveLaws,
    altHooks: hookPool.map(h => h[0]),
    proofUsed: t.name,
  };
}

export function seedProjects(): ContentPiece[] {
  const day = 86400000, now = Date.now();
  const mk = (o: { title: string; service: string; aud: AudienceId; goal: GoalId; tpl: TemplateId; t: number; ch?: string[]; st?: StatusType }) => ({
    id: 'p' + Math.random().toString(36).slice(2, 8),
    createdAt: o.t,
    channels: (o.ch || []) as ChannelId[],
    status: (o.st || 'draft') as StatusType,
    title: o.title,
    ...bakedGenerate({ contentType: 'ig-post', service: o.service, audience: o.aud, goal: o.goal }),
    template: o.tpl,
  }) as ContentPiece;

  return [
    mk({ title: 'Red Light Therapy — back pain', service: 'Red Light Therapy', aud: 'pain', goal: 'Education', tpl: 'educate', t: now - 2 * 3600e3, ch: ['instagram', 'facebook'], st: 'posted' }),
    mk({ title: 'Semaglutide — new year reset', service: 'Semaglutide', aud: 'weight', goal: 'New Guest Special', tpl: 'educate', t: now - day, ch: ['instagram'], st: 'scheduled' }),
    mk({ title: 'IV Therapy — energy slump', service: 'IV Drip Therapy', aud: 'energy', goal: 'Promotion', tpl: 'photo', t: now - 2 * day, ch: [], st: 'draft' }),
    mk({ title: 'HBOT — surgery recovery', service: 'HBOT / mHBOT', aud: 'healing', goal: 'Education', tpl: 'proof', t: now - 3 * day, ch: ['instagram', 'facebook', 'tiktok'], st: 'posted' }),
    mk({ title: 'Cryotherapy — athlete recovery', service: 'Cryotherapy', aud: 'healing', goal: 'Awareness', tpl: 'educate', t: now - 5 * day, ch: ['instagram'], st: 'posted' }),
    mk({ title: 'NAD+ — feeling off', service: 'NAD+ IV', aud: 'energy', goal: 'Education', tpl: 'editorial', t: now - 6 * day, ch: [], st: 'draft' }),
    mk({ title: 'Compression — leg recovery', service: 'Compression Therapy', aud: 'pain', goal: 'Awareness', tpl: 'statement', t: now - 8 * day, ch: ['instagram', 'facebook'], st: 'posted' }),
  ];
}
