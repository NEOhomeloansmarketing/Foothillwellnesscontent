'use client';
export default function Peaks({ color = '#C9A84C', w = 520, op = 1 }: { color?: string; w?: number; op?: number }) {
  return (
    <svg width={w} viewBox="0 0 520 320" fill="none" stroke={color} strokeWidth="6" style={{ opacity: op }} strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 110a70 70 0 01118-51"/>
      <path d="M70 250l90-110 50 60 40-50 110 150"/>
    </svg>
  );
}
