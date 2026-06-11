'use client';
import { useState } from 'react';
import Icon from './ui/Icon';
import type { ContentPiece } from '@/types';

interface CalendarProps {
  projects: ContentPiece[];
  onOpen: (p: ContentPiece) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function statusColor(status: string) {
  if (status === 'posted') return '#43a06a';
  if (status === 'scheduled') return '#D1BB74';
  return '#94a3b8';
}

export default function Calendar({ projects, onOpen }: CalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  // Index posted/scheduled projects by day-of-month
  const byDay: Record<number, ContentPiece[]> = {};
  for (const p of projects) {
    if (p.status !== 'posted' && p.status !== 'scheduled') continue;
    // Use postedAt if available, otherwise fall back to createdAt
    const ts = p.postedAt ?? (p.status === 'posted' ? p.createdAt : undefined);
    if (!ts) continue;
    const d = new Date(ts);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(p);
    }
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--cream)', overflow: 'auto', padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color: 'var(--navy-deep)', margin: 0 }}>
            Content Calendar
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            Posts sent via "Post to Instagram" appear here automatically
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {[['#43a06a','Posted'],['#D1BB74','Scheduled']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                {label}
              </div>
            ))}
          </div>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 12, padding: '6px 4px' }}>
            <button onClick={prevMonth} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, color: 'var(--navy-mid)' }}>
              <Icon n="chevL" size={16} />
            </button>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy-deep)', minWidth: 150, textAlign: 'center' }}>
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, color: 'var(--navy-mid)' }}>
              <Icon n="chevR" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid var(--line)', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1.5px solid var(--line)' }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: '12px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', flex: 1, alignContent: 'start' }}>
          {cells.map((day, idx) => {
            const posts = day ? (byDay[day] || []) : [];
            const today = isToday(day ?? -1);
            return (
              <div
                key={idx}
                style={{
                  minHeight: 110,
                  padding: '8px 10px',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--line-soft)' : 'none',
                  borderBottom: '1px solid var(--line-soft)',
                  background: day ? '#fff' : 'var(--cream)',
                  position: 'relative',
                }}
              >
                {day && (
                  <>
                    <div style={{
                      fontSize: 13, fontWeight: today ? 800 : 500,
                      color: today ? '#fff' : 'var(--navy-mid)',
                      width: 26, height: 26, borderRadius: '50%',
                      background: today ? 'var(--navy-deep)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 6,
                    }}>{day}</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {posts.slice(0, 3).map(p => (
                        <button
                          key={p.id}
                          onClick={() => onOpen(p)}
                          title={p.title}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: `${statusColor(p.status)}18`,
                            border: `1px solid ${statusColor(p.status)}40`,
                            borderLeft: `3px solid ${statusColor(p.status)}`,
                            borderRadius: 5, padding: '3px 6px',
                            cursor: 'pointer', textAlign: 'left', width: '100%',
                          }}
                        >
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(p.status), flex: 'none' }} />
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--navy-mid)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {p.service || p.title}
                          </span>
                        </button>
                      ))}
                      {posts.length > 3 && (
                        <div style={{ fontSize: 10, color: 'var(--muted)', paddingLeft: 4 }}>+{posts.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
