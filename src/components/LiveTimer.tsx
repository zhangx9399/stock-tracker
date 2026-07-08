'use client';

import { useEffect, useState } from 'react';

interface LiveTimerProps {
  buyDate: string; // ISO date string like "2021-11-02"
}

export default function LiveTimer({ buyDate }: LiveTimerProps) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const buy = new Date(buyDate + 'T00:00:00');
      const now = new Date();
      const diff = now.getTime() - buy.getTime();

      if (diff < 0) {
        setTimeStr('');
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const h = String(hours).padStart(2, '0');
      const m = String(minutes).padStart(2, '0');
      const s = String(seconds).padStart(2, '0');

      setTimeStr(`${h}:${m}:${s}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [buyDate]);

  if (!timeStr) return null;

  return (
    <div className="days-timer">
      + {timeStr.split(':').map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="days-timer-separator"> : </span>}
          {part}
        </span>
      ))}
    </div>
  );
}
