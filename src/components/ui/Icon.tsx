'use client';
const PATHS: Record<string, string> = {
  image:'M3 5.5h18v13H3z M3 15l5-5 4 4 3-3 6 6 M8.5 9.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4',
  carousel:'M7 5h10v14H7z M4 8v8 M20 8v8',
  story:'M5 3h14v18H5z M9 19h6',
  video:'M4 5h16v14H4z M4 9h16 M9 5l-1 4 M15 5l-1 4 M10.5 12.5v3l3-1.5z',
  flyer:'M6 3h9l3 3v15H6z M15 3v3h3 M9 11h6 M9 14h6 M9 17h4',
  handout:'M4 4h16v13H4z M4 21h16 M8 8h8 M8 11h8 M8 14h5',
  email:'M3 5h18v14H3z M3 6l9 7 9-7',
  sms:'M4 4h16v11H8l-4 4z M8 9h8 M8 12h5',
  blog:'M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5',
  ad:'M4 9v6h4l8 5V4l-8 5z M18 9a3 3 0 010 6',
  search:'M11 4a7 7 0 100 14 7 7 0 000-14z M20 20l-4-4',
  plus:'M12 5v14 M5 12h14',
  wand:'M5 19l9-9 M14 6l1.5-1.5 M19 11l1.5-1.5 M15 4l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z M14 10l1.2 1.2',
  download:'M12 4v11 M7 11l5 5 5-5 M5 20h14',
  send:'M5 12l15-7-6 15-3-6-6-2z',
  upload:'M12 16V5 M7 9l5-5 5 5 M5 20h14',
  check:'M5 12l5 5 9-11',
  chevR:'M9 5l7 7-7 7',
  chevL:'M15 5l-7 7 7 7',
  chevD:'M5 9l7 7 7-7',
  calendar:'M4 6h16v15H4z M4 10h16 M8 3v4 M16 3v4',
  grid:'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  bell:'M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6 M10 21h4',
  close:'M6 6l12 12 M18 6L6 18',
  refresh:'M20 8a8 8 0 10.5 6 M20 4v4h-4',
  copy:'M8 8h11v12H8z M5 16V4h11',
  edit:'M5 19h14 M14 5l4 4-9 9-4 1 1-4z',
  sparkle:'M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z M18 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z',
  shield:'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z M9 12l2 2 4-4',
  target:'M12 3a9 9 0 100 18 9 9 0 000-18z M12 8a4 4 0 100 8 4 4 0 000-8z M12 11.5a.5.5 0 100 1 .5.5 0 000-1',
  pulse:'M3 12h4l2-6 4 12 2-6h6',
  layers:'M12 3l9 5-9 5-9-5z M3 13l9 5 9-5',
  user:'M12 4a4 4 0 100 8 4 4 0 000-8z M4 21c0-4 4-6 8-6s8 2 8 6',
  clock:'M12 3a9 9 0 100 18 9 9 0 000-18z M12 7v5l3 2',
  trash:'M5 7h14 M9 7V4h6v3 M7 7l1 13h8l1-13',
  more:'M5 12h.01 M12 12h.01 M19 12h.01',
  arrowUp:'M12 19V6 M6 12l6-6 6 6',
  link:'M9 15l6-6 M10 7l1-1a4 4 0 016 6l-1 1 M14 17l-1 1a4 4 0 01-6-6l1-1',
  globe:'M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18',
  heart:'M12 20s-7-4.5-7-9.5A3.5 3.5 0 0112 7a3.5 3.5 0 017 3.5c0 5-7 9.5-7 9.5z',
  drop:'M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z',
  flame:'M12 3c.6 3 3 4 3 7a3 3 0 01-6 0c0-1.6.9-2.4 1.6-3 .2 1.2 1.4 1.2 1.4 0 0-1.4 0-2.7 0-4z',
  bolt:'M13 3L5 14h5l-1 7 8-11h-5z',
  lotus:'M12 13c-2.2 0-4-2-4-4.5 2.2 0 4 2 4 4.5 0-2.5 1.8-4.5 4-4.5 0 2.5-1.8 4.5-4 4.5z M4 12c2-1 4 0 8 0s6-1 8 0c-1.2 2.8-4 4.5-8 4.5S5.2 14.8 4 12z',
  dumbbell:'M6.5 7v10 M3.5 9v6 M17.5 7v10 M20.5 9v6 M6.5 12h11',
  phone:'M5 4h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  pin:'M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z M12 8a2 2 0 100 4 2 2 0 000-4',
  moon:'M20 14a8 8 0 01-10-10 8 8 0 1010 10z',
};

interface IconProps {
  n: string;
  size?: number;
  sw?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function Icon({ n, size = 18, sw = 1.7, style, className }: IconProps) {
  const d = PATHS[n];
  if (!d) return null;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split(' M').map((seg, i) => <path key={i} d={(i ? 'M' : '') + seg} />)}
    </svg>
  );
}
