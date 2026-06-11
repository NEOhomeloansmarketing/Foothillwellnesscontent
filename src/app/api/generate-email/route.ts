import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getReviewsForService } from '@/lib/testimonials';
import type { AudienceId } from '@/types';

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AUD: Record<AudienceId, string> = {
  pain: 'People dealing with chronic pain and inflammation',
  healing: 'People recovering from injury, surgery, or athletic strain',
  weight: 'People wanting weight loss and body composition change',
  energy: 'People feeling depleted, stressed, fatigued, or inflamed',
};

const SYSTEM = `You are the Foothill Wellness Email Marketing Assistant.

Your job is to write customer-centered, emotionally resonant marketing emails for Foothill Wellness that help people feel understood, believe improvement is possible, and take a clear next step.

PRIMARY STRATEGY — Five Laws of Marketing:
1. It is not about Foothill Wellness. The customer is the hero. Foothill is the trusted guide.
2. Lead with their problem. Open with the pain, frustration, fear, or desire already on the customer's mind.
3. Increase perceived likelihood of success. Use proof, testimonials, or believable mechanisms.
4. Increase perceived speed to the dream outcome. Make progress feel closer and faster.
5. Increase perceived ease to the dream outcome. Make the next step simple, low-pressure, and clear.

Messaging sequence: Problem → Empathy → Guide → Plan → Proof → Speed → Ease → Action

Brand positioning: Foothill Wellness helps people in Salt Lake City feel better faster through personalized wellness, recovery, regenerative, aesthetic, and medical weight-loss services.

Brand lines:
- Feel Better Faster.
- Your body already knows how to heal. We help it heal faster.
- You are not trying to become someone new. You are trying to get yourself back.

Tone: Warm, clear, modern, premium, human, encouraging, confident.
Avoid: clinical, pushy, generic, overhyped, fear-based, or salesy.

Use supportive language: "may help", "can support", "many clients report", "designed to support".
Do NOT use: guaranteed results, cure claims, disease-treatment claims, miracle language.

Primary CTA: Call/text (801) 784-0095

Return ONLY valid minified JSON — no markdown, no code fences.`;

export async function POST(req: NextRequest) {
  try {
    const { service, audience, goal, notes } = await req.json();

    const reviews = getReviewsForService(service);
    const testimonial = reviews.find(r => r.rating === 5) ?? reviews[0];

    const audienceLabel = AUD[audience as AudienceId] ?? audience;

    const proofLine = testimonial
      ? `Real client testimonial to use: "${testimonial.text}" — ${testimonial.name}`
      : '';

    const userMessage = `Service: ${service}
Audience: ${audienceLabel}
Goal: ${goal}
${notes ? `Notes: ${notes}` : ''}
${proofLine}

Return ONLY valid minified JSON matching this exact schema:
{"subject":"problem-aware or outcome-focused subject line (under 60 chars)","previewText":"adds curiosity or emotional relevance (under 90 chars)","opening":"1-2 sentences naming the reader's problem or desire — never start with Foothill or We","empathy":"1-2 sentences — make them feel seen and understood","explanation":"2-3 sentences — explain the service simply with a believable mechanism, use 'may help' language","proof":"The testimonial formatted as: \\"quote\\" — Name","speed":"1-2 sentences — make the outcome feel closer/sooner","ease":"1-2 sentences — make the first step feel effortless","cta":"Call or text (801) 784-0095 — we're here to help you figure out what's right for you.","closing":"Warm sign-off — 1-2 short lines. End with: Foothill Wellness Team","ps":"Optional short P.S. that adds urgency or a bonus detail"}`;

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
