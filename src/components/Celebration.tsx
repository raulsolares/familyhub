import { useRef, useState } from 'react';
import { sounds } from '../utils/audio';

const EMOJIS = ['🎉', '⭐', '✨', '🌟', '🎊', '💫'];

interface Burst { id: number; text: string; pieces: { left: number; delay: number; emoji: string }[] }

/** Confeti + mensaje de puntos para premiar a los niños al completar algo */
export const useCelebration = () => {
  const [burst, setBurst] = useState<Burst | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const celebrate = (text: string, big = false) => {
    if (timer.current) clearTimeout(timer.current);
    const count = big ? 28 : 14;
    setBurst({
      id: Date.now(),
      text,
      pieces: Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      })),
    });
    if (big) sounds.kidCheer(); else sounds.points();
    timer.current = setTimeout(() => setBurst(null), 1900);
  };

  const node = burst ? (
    <div key={burst.id}>
      <div className="celebrate" aria-hidden>
        {burst.pieces.map((p, i) => (
          <span key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s` }}>{p.emoji}</span>
        ))}
      </div>
      <div className="toast-points" role="status">{burst.text}</div>
    </div>
  ) : null;

  return { celebrate, celebrationNode: node };
};
