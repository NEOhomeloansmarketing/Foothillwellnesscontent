import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AUD } from '@/lib/content';
import { fiveLaws } from '@/lib/brand';
import { getReviewsForService } from '@/lib/testimonials';
import type { AudienceId } from '@/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { service, audience, goal, notes, usedHooks = [], proofUsed } = await req.json();

  // Get service-specific reviews (falls back to generic if no match)
  const reviews = getReviewsForService(service);

  // Pin to the specific review already on the graphic (if provided), otherwise pick first match
  const pinned = (proofUsed ? reviews.find(r => r.name === proofUsed) : null) ?? reviews[0];

  const proofBlock = pinned
    ? `USE THIS EXACT CLIENT REVIEW VERBATIM in the caption — copy word-for-word, do not paraphrase:\n"${pinned.text}" — ${pinned.name}`
    : '';

  const lawsBlock = fiveLaws.map(l => `  Law ${l.n}: ${l.name} — ${l.test}`).join('\n');

  const prompt = `You are writing Instagram content for Foothill Wellness (Salt Lake City, UT).

CRITICAL RULE — READ THIS FIRST:
The VERY FIRST WORD of the hook must be a problem, pain, or "you/your" statement. NEVER start with the service name, "At Foothill", "Foothill Wellness", "We", "Our", or any business name.

❌ WRONG hooks (automatic fail):
- "Cryotherapy can help you recover faster"
- "Infrared Sauna sessions at Foothill Wellness..."
- "At Foothill Wellness, we offer..."
- "Red Light Therapy is amazing for..."

✅ CORRECT hooks (start with the customer's reality):
- "Still sore days after your workout?"
- "Struggling to sleep no matter what you try?"
- "Tired of feeling wiped out by 2pm every day?"
- "Can't shake that brain fog no matter what you do?"

THE FIVE LAWS — every piece must pass ALL FIVE:

LAW 1 — NOT about us. Customer is HERO, we are the guide.
Use "you/your" at least 3x more than "we/our". Never open with the business.

LAW 2 — LEAD WITH THEIR PROBLEM. The hook and first sentence of the caption must name the exact frustration the ${AUD[audience as AudienceId]} audience feels RIGHT NOW — before you ever mention ${service}.

LAW 3 — BUILD BELIEF. Include one specific result, mechanism, or the verbatim testimonial below to prove it works.

LAW 4 — SPEED. Use time language: "in as little as one session", "within days", "same-day relief", "30 minutes".

LAW 5 — EASE. Make the first step feel effortless: "one call", "no prescription needed", "just 30 minutes of your day".

═══════════════════════════
ASSIGNMENT
═══════════════════════════
Service: ${service}
Audience: ${AUD[audience as AudienceId]}
Goal: ${goal}
${notes ? `Notes: ${notes}` : ''}
Do NOT reuse these hooks: ${usedHooks.join(' | ') || 'none'}

Caption structure (in order): Problem → Empathy → Guide → Plan → Proof (testimonial) → Speed → Ease → CTA
Final line of caption must be: "📞 Call or text (801) 784-0095 · Foothill Wellness, Salt Lake City"

Use "may help", "can support", "many clients report" — never guarantee results. No disease claims.

═══════════════════════════
REQUIRED CLIENT REVIEW — COPY WORD FOR WORD
═══════════════════════════
Place this exact quote verbatim in the Proof section of the caption. Do not paraphrase:

"${pinned?.text}" — ${pinned?.name}

═══════════════════════════
SELF-CHECK (before outputting JSON)
═══════════════════════════
Does the hook start with the customer's PROBLEM or "you"? (not the service name) → if no, rewrite
Does the caption open with the customer's pain before mentioning ${service}? → if no, rewrite
Is the testimonial quote copied exactly? → if no, fix it
Does the caption mention speed AND ease? → if no, add them

Return ONLY valid minified JSON, no markdown, no explanation:
{"hook":"≤65 chars — MUST start with customer problem or 'you', e.g. 'Still sore days later? Your body needs this.'","emphasis":"1-3 word bold phrase from hook","subhook":"one warm sentence bridging the problem to ${service} as the solution — use 'you'","caption":"full IG caption: Problem→Empathy→Guide→Plan→Proof(verbatim quote)→Speed→Ease→CTA. End with: 📞 Call or text (801) 784-0095 · Foothill Wellness, Salt Lake City","hashtags":["8 relevant hashtags with #"]}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = (message.content[0] as { text: string }).text;
    const j = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    return NextResponse.json({ ok: true, data: j });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
