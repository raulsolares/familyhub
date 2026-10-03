import { useState } from 'react';
import { Plus, Trash2, X, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';
import { todayKey } from '../utils/dates';

const scoreColor = (n: number) => (n >= 9 ? '#10b981' : n >= 7 ? '#f59e0b' : '#ef4444');

/** Calificaciones por niño y materia, con promedio por periodo */
const GradesPanel = ({ child, canEdit }: { child: string; canEdit: boolean }) => {
  const { grades, members, addGrade, deleteGrade, addPointLog } = useData();
  const children = members.filter(m => m.role === 'child').map(m => m.name);

  const [showForm, setShowForm] = useState(false);
  const [gChild, setGChild] = useState(child !== 'Todos' ? child : children[0] || '');
  const [subject, setSubject] = useState('');
  const [period, setPeriod] = useState('');
  const [score, setScore] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [reward, setReward] = useState(true);

  const visible = grades
    .filter(g => child === 'Todos' || g.child === child)
    .sort((a, b) => b.date.localeCompare(a.date));

  const kidsShown = child === 'Todos' ? children : [child];
  const subjects = Array.from(new Set(grades.map(g => g.subject)));
  const periods = Array.from(new Set(grades.map(g => g.period)));

  const average = (name: string) => {
    const mine = grades.filter(g => g.child === name);
    if (!mine.length) return null;
    return mine.reduce((s, g) => s + g.score, 0) / mine.length;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score === '') return;
    addGrade({ child: gChild, subject: subject.trim(), period: period.trim(), score: Number(score), date: todayKey(), notes: notes.trim() || undefined });
    // Premio automático por buena calificación
    if (reward && Number(score) >= 9) {
      addPointLog({ member: gChild, description: `Escuela: ${Number(score)} en ${subject.trim()}`, points: Number(score) === 10 ? 50 : 30 });
    }
    setSubject(''); setScore(''); setNotes(''); setShowForm(false);
  };

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <h3 className="card-title"><TrendingUp size={16} color="var(--p-primary)" /> Calificaciones</h3>
        {canEdit && <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={14} /> Registrar</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {kidsShown.map(name => {
          const avg = average(name);
          return (
            <div key={name} style={{ padding: '0.75rem', borderRadius: 'var(--radius)', background: 'var(--p-background)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--p-text-muted)' }}>Promedio {name}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: avg === null ? 'var(--p-text-muted)' : scoreColor(avg) }}>{avg === null ? '—' : avg.toFixed(1)}</p>
            </div>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '0.5rem' }}>Aún no hay calificaciones registradas</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {visible.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', background: 'var(--p-background)', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', width: '2.5rem', textAlign: 'center', color: scoreColor(g.score) }}>{g.score}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{g.subject}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)' }}>{g.child}{g.period ? ` · ${g.period}` : ''}{g.notes ? ` · ${g.notes}` : ''}</p>
              </div>
              {canEdit && <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteGrade(g.id)} aria-label="Borrar"><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Registrar calificación</h3>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Niño/a</label>
                  <select value={gChild} onChange={e => setGChild(e.target.value)}>
                    {children.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Calificación (0-10) *</label>
                  <input required type="number" min="0" max="10" step="0.1" value={score} onChange={e => setScore(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Materia *</label>
                  <input required list="fh-subjects" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ej: Matemáticas" />
                  <datalist id="fh-subjects">{subjects.map(s => <option key={s} value={s} />)}</datalist>
                </div>
                <div className="form-group">
                  <label className="form-label">Periodo</label>
                  <input list="fh-periods" value={period} onChange={e => setPeriod(e.target.value)} placeholder="Ej: Bimestre 1" />
                  <datalist id="fh-periods">{periods.map(p => <option key={p} value={p} />)}</datalist>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={reward} onChange={e => setReward(e.target.checked)} style={{ width: 'auto' }} />
                Premiar con puntos si saca 9 o 10 (+30 / +50)
              </label>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesPanel;
