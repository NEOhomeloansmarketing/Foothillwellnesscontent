import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are the Foothill Wellness print marketing specialist.
Write flyer copy using the Five Laws of Marketing: Problem → Empathy → Guide → Proof → Speed → Ease → Action.
Tone: premium, clear, warm, confident. Speak to the client's pain first.
Use "may help", "can support", "many clients report" — no cure claims or guarantees.
Primary CTA is always the phone number: (801) 784-0095
Return ONLY valid minified JSON — no markdown, no code fences, no extra text.`;

export async function POST(req: NextRequest) {
  try {
    const { service, audience, goal, notes } = await req.json();

    const prompt = `Create flyer copy for a Foothill Wellness print flyer.
Service: ${service}
Audience: ${audience}
Goal: ${goal}
Extra notes: ${notes || 'none'}

Return this exact JSON structure:
{
  "headline": "TWO OR THREE WORD SERVICE NAME IN CAPS (e.g. INFRARED SAUNA)",
  "subheadline": "Short punchy benefit statement in caps (e.g. DEEP HEAT. REAL BENEFITS.)",
  "description": "2-3 sentence description of the service and its benefits. Speak to the client's pain first.",
  "tagline": "3-6 word aspirational phrase (e.g. Recharge, Restore, and Feel Your Best)",
  "cta": "(801) 784-0095",
  "benefits": [
    { "icon": "🧊", "title": "BENEFIT TITLE", "desc": "One short sentence about this benefit." },
    { "icon": "⚡", "title": "BENEFIT TITLE", "desc": "One short sentence about this benefit." },
    { "icon": "🌿", "title": "BENEFIT TITLE", "desc": "One short sentence about this benefit." },
    { "icon": "💤", "title": "BENEFIT TITLE", "desc": "One short sentence about this benefit." },
    { "icon": "❤️", "title": "BENEFIT TITLE", "desc": "One short sentence about this benefit." },
    { "icon": "🏃", "title": "BENEFIT TITLE", "desc": "One short sentence about this benefit." }
  ],
  "stats": [
    { "value": "KEY STAT", "label": "what it means" },
    { "value": "KEY STAT", "label": "what it means" },
    { "value": "KEY STAT", "label": "what it means" }
  ]
}

Pick relevant emojis for each benefit icon. Stats should be compelling numbers if applicable (session length, temperature, time to results, etc.) — if no relevant stats exist, use short punchy phrases.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = (message.content[0] as { text: string }).text;
    const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    return NextResponse.json({ ok: true, data: json });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
