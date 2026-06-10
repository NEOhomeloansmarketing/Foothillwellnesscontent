import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { instruction, hook, caption } = await req.json();

  const prompt = `Revise this Foothill Wellness Instagram content per the request, keeping brand voice (warm, human, Five-Laws aligned) and the CTA "Call or text (801) 784-0095". Guardrails: no guaranteed results or disease claims; use "may help / can support / many clients report".

Request: "${instruction}"
Current hook: "${hook}"
Current caption: """${caption}"""

Return ONLY minified JSON: {"hook":"...","emphasis":"one word to italicize","subhook":"...","caption":"..."}`;

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
