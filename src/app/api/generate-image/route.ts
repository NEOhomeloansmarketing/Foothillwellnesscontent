import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Service → ideal photography style for DALL-E prompt
const SERVICE_STYLE: Record<string, string> = {
  'Cryotherapy': 'a modern cryotherapy chamber with cool blue LED lighting, a person emerging looking refreshed and energized',
  'Red Light Therapy': 'a person relaxing under warm red and near-infrared LED panels in a clean modern wellness clinic, glowing skin',
  'Infrared Sauna': 'a beautiful infrared sauna interior with warm cedar wood, soft glowing light, serene and luxurious',
  'Compression Therapy': 'a person in compression therapy boots lounging in a clean modern wellness center, relaxed and comfortable',
  'HBOT / mHBOT': 'a hyperbaric oxygen chamber in a premium wellness clinic, modern medical spa aesthetic',
  'IV Drip Therapy': 'a person receiving IV therapy in a luxurious wellness clinic, comfortable reclined chair, clean modern interior',
  'IV Infusions': 'a person receiving an IV infusion in a premium wellness clinic, relaxed and comfortable, soft modern lighting',
  'NAD+ IV': 'a vibrant energetic person in a premium wellness clinic, NAD+ IV therapy setting, modern clinical spa',
  'NAD+ IM': 'a confident healthy person in a modern wellness clinic, bright and energetic atmosphere',
  'Semaglutide': 'a confident woman with a healthy fit body, smiling naturally, bright wellness clinic background',
  'Tirzepatide': 'a happy fit person standing confidently in activewear, natural light, wellness lifestyle photography',
  'Microneedling': 'a woman with glowing clear smooth skin, close-up beauty portrait, clean white background, luxury spa',
  'Facials': 'a woman receiving a luxury facial treatment, serene expression, modern spa, soft lighting',
  'Botox': 'a naturally beautiful woman with smooth refreshed skin, elegant portrait, sophisticated wellness clinic',
  'Dermal Fillers': 'a woman with naturally beautiful lifted features, elegant portrait, luxury medical spa',
  'Emsculpt Neo': 'a toned confident person in a modern body contouring clinic, healthy athletic physique',
};

const AUDIENCE_STYLE: Record<string, string> = {
  pain: 'a person experiencing relief from chronic pain, peaceful expression, warm wellness clinic setting',
  healing: 'an athletic person in recovery, determined expression, modern sports medicine and wellness clinic',
  weight: 'a confident healthy woman in activewear, natural authentic smile, bright modern setting',
  energy: 'a radiant energetic woman, glowing skin, vibrant expression, premium wellness spa',
};

export async function POST(req: NextRequest) {
  const { prompt, service, audience } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY not configured in Vercel' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const serviceStyle = SERVICE_STYLE[service] || AUDIENCE_STYLE[audience] || 'a beautiful wellness spa setting with natural lighting';
  const userAddition = prompt ? ` Additional direction: ${prompt}.` : '';

  const fullPrompt = [
    'Editorial lifestyle wellness photography,',
    serviceStyle + '.',
    userAddition,
    'Professional photography, soft natural light, clean background, premium aesthetic, photorealistic.',
    'Color palette: warm neutrals, creamy whites, soft greens.',
    'Do NOT include text, logos, or watermarks.',
    'Instagram square format, high-end wellness brand visual.',
  ].join(' ');

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'medium',
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
