import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AUD } from '@/lib/content';
import { getReviewsForService } from '@/lib/testimonials';
import type { AudienceId } from '@/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { service, audience, goal, notes, usedHooks = [], proofUsed } = await req.json();

  const reviews = getReviewsForService(service);
  const pinned = (proofUsed ? reviews.find(r => r.name === proofUsed) : null) ?? reviews[0];

  const audienceLabel = AUD[audience as AudienceId] ?? audience;

  // Pull a short proof snippet (≤120 chars) from the testimonial for the caption
  const proofSnippet = pinned
    ? (pinned.text.length > 120 ? pinned.text.slice(0, 118).replace(/\s+\S*$/, '') + '…' : pinned.text)
    : null;

  const prompt = `Service: ${service}
Audience: ${audienceLabel}
Goal: ${goal}
${notes ? `Notes: ${notes}` : ''}
Don't reuse these hooks: ${usedHooks.join(' | ') || 'none'}

${proofSnippet ? `Client review to use (short quote from ${pinned!.name}):\n"${proofSnippet}" — ${pinned!.name}` : ''}

Write the Instagram caption using the exact format and length shown in the EXAMPLE below. Match the voice, rhythm, and structure precisely. Then return the full JSON.`;

  const system = `You are the Instagram content voice for Foothill Wellness — a premium wellness center in Salt Lake City, UT.

Brand positioning:
- "Feel Better Faster."
- "Your body already knows how to heal itself. We just help it heal faster."
- The customer is the HERO. Foothill Wellness is the trusted GUIDE.

──────────────────────────────
CAPTION FORMAT (follow this exactly — short lines, lots of white space)
──────────────────────────────

EXAMPLE OUTPUT for Red Light Therapy / chronic pain audience:

Feeling sore, stiff, or just worn down?

Watching everyone else move through their day while you're struggling just to keep up is exhausting.

The good news?

Your body was built to recover.

It just needs the right support.

Red light therapy may help reduce inflammation, ease pain, and speed up your recovery — often in as little as one session.

"I've had three sessions so far and my knee pain has improved dramatically." — Sarah T.

One 30-minute session. No prescription. No downtime.

Just show up — we handle everything.

📞 Call or text (801) 784-0095 · Foothill Wellness, Salt Lake City

──────────────────────────────
RULES (non-negotiable):

1. OPEN with the customer's problem or pain as a short question or statement. NEVER start with the service name, "At Foothill", "We", or "Our".
   ✅ "Feeling run down or stressed?"
   ✅ "Still sore days after your workout?"
   ❌ "Cryotherapy can help you..."
   ❌ "At Foothill Wellness, we offer..."

2. EMPATHY line: acknowledge the frustration they feel. Make them feel seen.

3. PIVOT: use a short turn phrase like "The good news?" or "Here's the truth." on its own line.

4. HOPE: 1-2 lines — your body can heal, it just needs support.

5. SERVICE line: name the service and ONE specific benefit. Use "may help", "can support". Include a speed signal ("one session", "within days", "30 minutes").

6. PROOF: include the client review snippet provided. Format: "quote" — Name

7. EASE line: make the first step feel effortless. "One call. No prescription. Just show up."

8. CTA — final line must be exactly: 📞 Call or text (801) 784-0095 · Foothill Wellness, Salt Lake City

9. Keep every line SHORT. Separate EVERY beat with a blank line. Use \\n\\n between each section in the JSON string so the spacing is preserved exactly when posted to Instagram. No walls of text.

10. Return ONLY valid minified JSON. No markdown. No code fences.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      system,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = (message.content[0] as { text: string }).text;
    const j = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    return NextResponse.json({ ok: true, data: j });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
