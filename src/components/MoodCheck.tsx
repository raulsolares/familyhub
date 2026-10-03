import { useState } from 'react';
import { useData } from '../context/DataContext';
import { MOOD_SLOTS, MOODS, moodById, currentSlot } from '../utils/mood';
import type { MoodSlot } from '../utils/mood';
import { todayKey } from '../utils/dates';
import { sounds, speak, canSpeak } from '../utils/audio';
import { notify } from '../utils/push';

/** Registro de ánimo del niño: mañana, tarde y noche */
const MoodCheck = ({ kidName, compact = false }: { kidName: string; compact?: boolean }) => {
  const { moodLogs, setMood } = useData();
  const today = todayKey();
  const now = currentSlot();
  const [slot, setSlot] = useState<MoodSlot>(now);

  const moodOf = (s: MoodSlot) => moodLogs.find(l => l.member === kidName && l.date === today && l.slot === s);
  const current = moodOf(slot);
  const info = MOOD_SLOTS.find(s => s.id === slot)!;
  const slotIdx = MOOD_SLOTS.findIndex(s => s.id === now);

  const pick = (moodId: string) => {
    if (current?.mood === moodId) { setMood(kidName, slot, null); sounds.deselect(); return; }
    setMood(kidName, slot, moodId);
    sounds.select();
    const m = moodById(moodId);
    if (m?.tough) {
      notify({
        to: 'parents',
        title: `${m.emoji} ${kidName} se siente ${m.label.toLowerCase()}`,
        body: `Lo registró en la ${info.label.toLowerCase()}. Un abrazo puede ayudar.`,
        url: '/habits',
        tag: `mood-${kidName}-${today}-${slot}`,
      });
    }
  };

  return (
    <section className={`mood${compact ? ' compact' : ''}`} aria-label="¿Cómo te sientes?">
      <div className="mood-head">
        <h3>💗 {info.question}</h3>
        {canSpeak() && <button className="mood-say" onClick={() => speak(`${info.question} Toca la carita que se parece a cómo te sientes.`)} aria-label="Escuchar">🔊</button>}
      </div>
      <div className="mood-slots" role="tablist">
        {MOOD_SLOTS.map((s, i) => {
          const m = moodById(moodOf(s.id)?.mood);
          const future = i > slotIdx;
          return (
            <button
              key={s.id} role="tab" aria-selected={slot === s.id} disabled={future}
              className={`mood-slot${slot === s.id ? ' on' : ''}${m ? ' set' : ''}`}
              onClick={() => setSlot(s.id)}
            >
              <span className="mood-slot-face">{m ? m.emoji : future ? '⏳' : '❔'}</span>
              <span className="mood-slot-label">{s.emoji} {s.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mood-faces">
        {MOODS.map(m => (
          <button key={m.id} className={`mood-face${current?.mood === m.id ? ' on' : ''}`} onClick={() => pick(m.id)} aria-pressed={current?.mood === m.id}>
            <span>{m.emoji}</span>
            <small>{m.label}</small>
          </button>
        ))}
      </div>
    </section>
  );
};

export default MoodCheck;
