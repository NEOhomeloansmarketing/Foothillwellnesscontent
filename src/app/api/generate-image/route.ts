import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60;

const AUDIENCE_THEME: Record<string, string> = {
  pain: 'someone experiencing chronic pain, stiffness, or physical discomfort — showing relief or the hope of healing',
  healing: 'an athlete or active person in recovery, determined and resilient',
  weight: 'a confident, healthy person in their element — active, energized, comfortable in their body',
  energy: 'a radiant, energized person — glowing, focused, fully alive',
};

export async function POST(req: NextRequest) {
  const { service, audience, hook, subhook } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY not configured' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const audienceTheme = AUDIENCE_THEME[audience] || 'a person seeking wellness, healing, and vitality';

  // Build a creative brief from the actual post content
  const contextBlock = (hook || subhook)
    ? `The Instagram post this image accompanies says: "${hook}${subhook ? ' — ' + subhook : ''}". The image should feel like a direct visual expression of that message.`
    : `The service is ${service}.`;

  const fullPrompt = `${contextBlock}

Create a compelling, emotionally resonant lifestyle photograph for a premium wellness brand Instagram post about ${service}.

Subject: ${audienceTheme}.

Visual direction: Let the image tell the story of transformation — before/during/after a wellness moment. Think editorial fashion photography meets medical spa. The emotion should match the copy: if the post leads with pain or struggle, show that vulnerability and the relief that follows. If it leads with energy or confidence, show that vitality.

Give this image a distinct, specific mood — don't default to a generic spa aesthetic. Consider: dramatic natural light, a specific moment of emotion, an unexpected angle, a close-up detail, an outdoor wellness setting, or a candid human moment. Surprise us.

Premium wellness brand. Photorealistic. No text, logos, or watermarks. Square format.`;

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'low',
    });

    const b64 = response.data?.[0]?.b64_json;
    const url = response.data?.[0]?.url;
    const imageData = b64 ? `data:image/png;base64,${b64}` : url;

    if (!imageData) {
      return NextResponse.json({ ok: false, error: 'No image returned' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, dataUrl: imageData });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
