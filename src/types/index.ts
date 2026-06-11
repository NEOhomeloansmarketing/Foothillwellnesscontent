export type AudienceId = 'pain' | 'healing' | 'weight' | 'energy';
export type TemplateId = 'educate' | 'statement' | 'proof' | 'photo' | 'editorial';
export type StatusType = 'draft' | 'scheduled' | 'posted';
export type ChannelId = 'instagram' | 'google';

export interface SocialAccount {
  platform: 'instagram' | 'google';
  accessToken: string;
  refreshToken?: string;
  accountId: string;
  locationId?: string;
  name: string;
  connectedAt: number;
}
export type GoalId = 'Awareness' | 'Education' | 'New Guest Special' | 'Promotion';

export interface Benefit {
  icon: string;
  label: string;
}

export interface FiveLaw {
  law: string;
  score: number;
  note: string;
}

export interface GraphicContent {
  eyebrow: string;
  hook: string;
  emphasis: string;
  subhook: string;
  ctaShort: string;
  quote: string;
  proofName: string;
  proofMeta: string;
  title: string;
  tagline: string;
  problemHook: string;
  problemEmphasis: string;
  problemDesc: string;
  aspiration: string;
  benefits: [string, string][];
  speed: string;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;   // position in 1080px space
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  fontFamily: 'serif' | 'sans';
}

export interface ContentPiece {
  id: string;
  createdAt: number;
  title: string;
  contentType: string;
  service: string;
  audience: AudienceId;
  goal: GoalId;
  template: TemplateId;
  graphic: GraphicContent;
  caption: string;
  hashtags: string[];
  fiveLaws: FiveLaw[];
  autoImage: string | string[] | null;
  imgKeywords: string;
  altHooks: string[];
  proofUsed: string;
  channels: ChannelId[];
  status: StatusType;
  userImage?: boolean;
  textOverlays?: TextOverlay[];
  textPositions?: Record<string, { x: number; y: number }>;
  postedAt?: number;       // unix ms when the post was sent to Zapier
  emailContent?: EmailContent;
  flyerContent?: FlyerContent;
}

export interface FlyerBenefit {
  icon: string;   // emoji or short text
  title: string;
  desc: string;
}

export interface FlyerStat {
  value: string;
  label: string;
}

export interface FlyerContent {
  template: 'split' | 'hero' | 'checklist';
  headline: string;
  subheadline: string;
  description: string;
  benefits: FlyerBenefit[];
  stats: FlyerStat[];
  tagline: string;
  cta: string;
}

export interface EmailContent {
  subject: string;
  previewText: string;
  opening: string;
  empathy: string;
  explanation: string;
  proof: string;
  speed: string;
  ease: string;
  cta: string;
  closing: string;
  ps?: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  sugg?: string[];
}

export interface GenerateOptions {
  contentType: string;
  service: string;
  audience: AudienceId;
  goal: GoalId;
  notes?: string;
  userImage?: string | null;
  usedHooks?: string[];
  usedProof?: string[];
}
