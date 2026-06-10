export type AudienceId = 'pain' | 'healing' | 'weight' | 'energy';
export type TemplateId = 'educate' | 'statement' | 'proof' | 'photo' | 'editorial';
export type StatusType = 'draft' | 'scheduled' | 'posted';
export type ChannelId = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'google';
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
