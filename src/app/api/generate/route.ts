import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AUD } from '@/lib/content';
import { fiveLaws, testimonials } from '@/lib/brand';
import type { AudienceId } from '@/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { service, audience, goal, notes, usedHooks = [] } = await req.json();

  // Pull service-specific testimonials first, then audience-tagged fallbacks
  const serviceTestimonials = testimonials.filter(t => t.services?.includes(service));
  const audienceTestimonials = testimonials.filter(t => t.tag === audience && !serviceTestimonials.includes(t));
  const relevantProof = [...serviceTestimonials, ...audienceTestimonials].slice(0, 3);

  const proofBlock = relevantProof.length
    ? `REAL CLIENT TESTIMONIALS (use one of these for the caption proof section):\n` +
      relevantProof.map(t => `- "${t.text}" — ${t.name}`).join('\n')
    : '';

  const lawsBlock = fiveLaws.map(l => `  Law ${l.n}: ${l.name} — ${l.test}`).join('\n');

  const prompt = `You are the brand voice for Foothill Wellness, a premium wellness center in Salt Lake City, UT.

BRAND PROMISE: "Your body already knows how to heal itself. Foothill Wellness helps it heal faster."
TAGLINE: "Feel Better Faster"
VOICE: Warm, confident, knowledgeable, human, encouraging. Premium but approachable. Never salesy. Never clinical jargon. Never miracle claims.

THE FIVE LAWS OF MARKETING — every piece must pass all five:
${lawsBlock}

GUARDRAILS:
• No guaranteed results or disease-treatment claims
• Use "may help", "can support", "many clients report"
• Customer is the HERO — Foothill is the guide
• More "you" than "we"
• Lead with the client's PROBLEM before ever naming the treatment

CONTENT ASSIGNMENT:
Service: ${service}
Audience: ${AUD[audience as AudienceId]}
Goal: ${goal}
${notes ? `Team notes: ${notes}` : ''}
Avoid repeating these hooks: ${usedHooks.join(' | ') || 'none'}

${proofBlock}

CAPTION SEQUENCE TO FOLLOW: Problem → Empathy → Guide → Plan → Proof → Speed → Ease → Action
The hook must name the PROBLEM the audience already FEELS — before mentioning ${service}.
End the caption with: "Call or text (801) 784-0095 · Foothill Wellness, Salt Lake City"

Return ONLY valid minified JSON (no markdown fences, no explanation outside JSON):
{"hook":"≤60-char hook that MUST include the word '${service}' and leads with a clear benefit or problem (e.g., 'Cryotherapy: fast recovery, zero inflammation.' or 'Infrared Sauna — deep heat that actually heals.')","emphasis":"1-3 word phrase from hook to italicize","subhook":"one warm human sentence naming ${service} and what it may do for the client's specific situation","caption":"full IG caption, plain text with line breaks","hashtags":["8 relevant hashtags with #"]}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1400,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = (message.content[0] as { text: string }).text;
    const j = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    return NextResponse.json({ ok: true, data: j });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
