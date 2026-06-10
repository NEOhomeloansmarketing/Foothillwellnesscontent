import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AUD } from '@/lib/content';
import type { AudienceId } from '@/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { service, audience, goal, notes, usedHooks = [] } = await req.json();

  const prompt = `You are Foothill Wellness's marketing strategist. Brand: "Feel Better Faster". Voice: warm, confident, human, premium-but-approachable, never salesy or clinical. Filter through the Five Laws of Marketing (customer is hero, lead with their problem, build belief, make it feel faster + easier, low-friction CTA). Guardrails: no guaranteed results or disease claims; use "may help / can support / many clients report".

Create an Instagram post for service "${service}", audience "${AUD[audience as AudienceId]}", goal "${goal}".${notes ? ` Additional notes from the team: ${notes}` : ''} Avoid repeating these hooks already used: ${usedHooks.join(' | ') || 'none'}.

Return ONLY valid minified JSON: {"hook":"short bold hook (<=60 chars)","emphasis":"one word from hook to italicize","subhook":"one supportive sentence","caption":"full IG caption following Problem-Empathy-Guide-Proof-Speed-Ease structure, plain text with line breaks, end with: Call or text (801) 784-0095","hashtags":["8 relevant tags"]}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = (message.content[0] as { text: string }).text;
    const j = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    return NextResponse.json({ ok: true, data: j });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
