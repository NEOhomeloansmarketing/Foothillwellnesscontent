import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AUD } from '@/lib/content';
import { getReviewsForService } from '@/lib/testimonials';
import type { AudienceId } from '@/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Assemble caption from structured parts — guarantees correct spacing regardless of AI output
function assembleCaption(parts: {
  problem: string;
  empathy: string;
  pivot: string;
  hope: string;
  service: string;
  proof: string;
  ease: string;
  cta: string;
}): string {
  return [
    parts.problem,
    parts.empathy,
    parts.pivot,
    parts.hope,
    parts.service,
    parts.proof,
    parts.ease,
    parts.cta,
  ]
    .map(s => s?.trim())
    .filter(Boolean)
    .join('\n\n');
}

export async function POST(req: NextRequest) {
  const { service, audience, goal, notes, usedHooks = [], proofUsed } = await req.json();

  const reviews = getReviewsForService(service);
  const pinned = (proofUsed ? reviews.find(r => r.name === proofUsed) : null) ?? reviews[0];

  const audienceLabel = AUD[audience as AudienceId] ?? audience;

  const proofSnippet = pinned
    ? (pinned.text.length > 120 ? pinned.text.slice(0, 118).replace(/\s+\S*$/, '') + '…' : pinned.text)
    : null;

  const prompt = `Service: ${service}
Audience: ${audienceLabel}
Goal: ${goal}
${notes ? `Notes: ${notes}` : ''}
Don't reuse these hooks: ${usedHooks.join(' | ') || 'none'}

${proofSnippet ? `Client review to use:\n"${proofSnippet}" — ${pinned!.name}` : ''}

Return ONLY valid minified JSON matching the schema below. No markdown. No code fences.`;

  const system = `You are the Instagram content voice for Foothill Wellness — a premium wellness center in Salt Lake City, UT.

Brand voice: warm, confident, conversational. Short punchy sentences. The customer is the HERO, Foothill is the GUIDE.
Positioning: "Feel Better Faster." / "Your body already knows how to heal itself. We just help it heal faster."

HOOK (graphic text) RULES — non-negotiable:
- MUST open with the customer's problem, pain, or frustration as a short question or statement
- NEVER start with the service name, "Foothill", "We", "Our", "At Foothill", "Introducing", "Discover"
✅ "Feeling run down or stressed?" / "Still sore days after your workout?" / "Can't shake that brain fog?"
❌ "Cryotherapy can help..." / "Red Light Therapy is..." / "At Foothill Wellness..."

CAPTION STRUCTURE — write each section as its own short field:
- problem: short question or statement naming the customer's pain (NEVER start with service name)
- empathy: 1 sentence acknowledging the frustration, making them feel seen
- pivot: short pivot phrase on its own — "The good news?" or "Here's the truth."
- hope: 1-2 short sentences — their body can heal, it just needs support
- service: name the service + one specific benefit + speed signal ("one session", "within days", "30 min")
- proof: the client review in format: "quote" — Name
- ease: make the first step feel effortless — short, low-friction
- cta: exactly "📞 Call or text (801) 784-0095 · Foothill Wellness, Salt Lake City"

Each field is a plain string — short, human, no walls of text. Use "may help", "can support". No guaranteed results.

Return this exact JSON schema (minified, no extras):
{"hook":"≤65 chars — customer problem first, never service name","emphasis":"1-3 word phrase from hook to highlight","subhook":"one warm sentence bridging problem to service — use 'you'","caption":{"problem":"","empathy":"","pivot":"","hope":"","service":"","proof":"","ease":"","cta":"📞 Call or text (801) 784-0095 · Foothill Wellness, Salt Lake City"},"hashtags":["8 relevant hashtags"]}`;

  const forbiddenStarts = [
    service.toLowerCase().split(' ')[0],
    'foothill', 'at foothill', 'we ', 'our ', 'introducing', 'discover', 'try ', 'experience', 'get ',
  ];

  function hookStartsWithProblem(hook: string): boolean {
    const lower = hook.toLowerCase().trim();
    return !forbiddenStarts.some(f => lower.startsWith(f));
  }

  async function generate(retryNote = '') {
    const userContent = retryNote
      ? `${prompt}\n\nIMPORTANT: Your previous hook started with the service or business name. The hook MUST open with the customer's problem. Rewrite it.`
      : prompt;
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      system,
      messages: [{ role: 'user', content: userContent }],
    });
    const raw = (message.content[0] as { text: string }).text;
    const j = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));

    // Assemble the flat caption string from structured parts so spacing is always correct
    if (j.caption && typeof j.caption === 'object') {
      j.caption = assembleCaption(j.caption);
    }
    return j;
  }

  try {
    let j = await generate();
    if (!hookStartsWithProblem(j.hook)) {
      j = await generate('retry');
    }
    return NextResponse.json({ ok: true, data: j });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
