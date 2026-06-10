import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { testimonials } from '@/lib/brand';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { instruction, hook, caption, service, audience } = await req.json();

  // Provide relevant testimonials in case the user asks for proof/testimonials
  const serviceTestimonials = service
    ? testimonials.filter(t => t.services?.includes(service)).slice(0, 2)
    : [];
  const audienceTestimonials = audience
    ? testimonials.filter(t => t.tag === audience && !serviceTestimonials.includes(t)).slice(0, 2)
    : [];
  const proofPool = [...serviceTestimonials, ...audienceTestimonials];

  const proofBlock = proofPool.length
    ? `\nAvailable real client testimonials if needed:\n${proofPool.map(t => `- "${t.text}" — ${t.name}`).join('\n')}`
    : '';

  const prompt = `You are Foothill Wellness's AI writing assistant. Revise this Instagram content per the user's request.

BRAND: Warm, confident, human. Premium-but-approachable. Never salesy or clinical.
FIVE LAWS: Lead with customer's problem. Build belief with proof. Make it feel fast and easy. CTA is always low-friction.
GUARDRAILS: No guaranteed results or disease claims. Use "may help", "can support", "many clients report".
CTA ALWAYS: "Call or text (801) 784-0095"
${proofBlock}

User request: "${instruction}"
Current hook: "${hook}"
Current caption:
"""
${caption}
"""

Apply the requested change while keeping the Five-Laws structure, brand voice, and CTA intact.
Return ONLY minified JSON: {"hook":"...","emphasis":"1-3 word phrase to italicize","subhook":"one supportive sentence","caption":"full updated caption"}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = (message.content[0] as { text: string }).text;
    const j = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    return NextResponse.json({ ok: true, data: j });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
