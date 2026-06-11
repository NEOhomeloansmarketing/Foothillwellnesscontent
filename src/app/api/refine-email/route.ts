import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { EmailContent } from '@/types';

export const maxDuration = 45;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are the Foothill Wellness Email Marketing Assistant.
Rewrite or refine the provided email based on the user's instruction.
Keep the Five Laws of Marketing structure: Problem → Empathy → Guide → Proof → Speed → Ease → Action.
Tone: warm, clear, modern, premium, human, encouraging, confident.
Use "may help", "can support", "many clients report" — no guarantees or cure claims.
Primary CTA always: Call/text (801) 784-0095
Return ONLY valid minified JSON — no markdown, no code fences.`;

export async function POST(req: NextRequest) {
  try {
    const { instruction, email, service } = await req.json() as {
      instruction: string;
      email: EmailContent;
      service: string;
    };

    const userMessage = `Service: ${service}

Current email:
${JSON.stringify(email)}

User instruction: "${instruction}"

Apply the instruction and return the updated email as ONLY valid minified JSON with the same fields:
{"subject":"...","previewText":"...","opening":"...","empathy":"...","explanation":"...","proof":"...","speed":"...","ease":"...","cta":"...","closing":"...","ps":"..."}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = (message.content[0] as { text: string }).text;
    const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    return NextResponse.json({ ok: true, data: json });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
