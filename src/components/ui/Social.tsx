'use client';
interface SocialProps { n: string; size?: number; }

export default function Social({ n, size = 18 }: SocialProps) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (n === 'instagram') return <svg {...c}><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" stroke="none"/></svg>;
  if (n === 'facebook') return <svg {...c}><path d="M14 8h2V5h-2c-1.8 0-3 1.4-3 3.2V10H9v3h2v6h3v-6h2.2l.5-3H14V8.6c0-.4.3-.6.6-.6z"/></svg>;
  if (n === 'tiktok') return <svg {...c}><path d="M14 4v9.5a3.2 3.2 0 11-2.6-3.1 M14 4c.4 2 1.8 3.4 3.8 3.7"/></svg>;
  if (n === 'youtube') return <svg {...c}><rect x="3" y="6.5" width="18" height="11" rx="3"/><path d="M11 9.5l4 2.5-4 2.5z" fill="currentColor" stroke="none"/></svg>;
  if (n === 'google') return <svg {...c}><path d="M20 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.5a3.9 3.9 0 01-1.7 2.5v2.1h2.7c1.6-1.5 2.5-3.7 2.5-6.2z M12 21c2.3 0 4.2-.8 5.6-2.1l-2.7-2.1c-.8.5-1.7.8-2.9.8-2.2 0-4.1-1.5-4.8-3.5H4.4v2.2A9 9 0 0012 21z M7.2 12.9a5.4 5.4 0 010-3.5V7.2H4.4a9 9 0 000 8.1z M12 6.6c1.2 0 2.3.4 3.2 1.3l2.4-2.4A9 9 0 004.4 7.2l2.8 2.2C7.9 7.4 9.8 6.6 12 6.6z"/></svg>;
  return null;
}
