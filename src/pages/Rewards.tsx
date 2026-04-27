import { useState } from 'react';
import { Award, TrendingUp, Trophy, History, PlusSquare, Trash2, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

const Rewards = () => {
  const { user } = useUser();
  const { points, pointLogs, rules, addPointLog, deletePointLog, members } = useData();

  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState('Alan');
  const [selectedRule, setSelectedRule] = useState(rules[0]?.id || '');

  const isAdmin = user?.username === 'papa';

  const handleApplyRule = (e: React.FormEvent) => {
    e.preventDefault();
    const rule = rules.find(r => r.id === selectedRule);
    if (rule) {
      addPointLog({ 
        member: selectedMember, 
        description: rule.description, 
        points: rule.points 
      });
      setShowLogForm(false);
    }
  };

  const scoreboard = members
    .filter(m => m.role === 'child')
    .map(m => ({ ...m, pts: points[m.name] || 0 }))
    .sort((a, b) => b.pts - a.pts);

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Puntos y Logros</h1>
          <p className="page-subtitle">Seguimiento de comportamiento y metas familiares</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowLogForm(true)} className="btn-primary" style={{ background: '#f59e0b' }}>
            <PlusSquare size={18} /> Aplicar Reto/Premio
          </button>
        )}
      </header>

      {/* Modal Aplicar Regla Manualmente */}
      {showLogForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowLogForm(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Aplicar Reto o Premio</h3>
            <form onSubmit={handleApplyRule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Para:</label>
                <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  {members.filter(m => m.role === 'child').map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Regla a aplicar:</label>
                <select value={selectedRule} onChange={e => setSelectedRule(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  {rules.map(r => <option key={r.id} value={r.id}>{r.description} ({r.points} pts)</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ background: '#f59e0b', marginTop: '1rem' }}>Aplicar ahora</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card">
          <h3 className="card-title"><Trophy size={20} color="#eab308" /> Tabla de Clasificación</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            {scoreboard.map((member, i) => (
              <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: i === 0 ? '#fefce8' : '#f8fafc', borderRadius: '12px', border: i === 0 ? '1px solid #fef08a' : '1px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: '800', color: i === 0 ? '#ca8a04' : '#64748b', width: '20px' }}>{i + 1}</span>
                  <div style={{ fontSize: '1.5rem' }}>{member.avatar}</div>
                  <span style={{ fontWeight: '700' }}>{member.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '800' }}>{member.pts} pts</span>
                  <TrendingUp size={16} color="#10b981" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title"><Award size={20} color="var(--p-primary)" /> Reglas Activas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {rules.map(rule => (
              <div key={rule.id} style={{ padding: '0.6rem 1rem', background: '#f8fafc', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600' }}>{rule.description}</span>
                <span style={{ fontWeight: '800', color: rule.points > 0 ? '#10b981' : '#ef4444' }}>{rule.points > 0 ? `+${rule.points}` : rule.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auditoría de Puntos (Solo Papá) */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 className="card-title"><History size={20} color="var(--p-primary)" /> Historial de Auditoría {isAdmin && '(Solo Raúl)'}</h3>
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '1rem' }}>Fecha</th>
                <th style={{ padding: '1rem' }}>Miembro</th>
                <th style={{ padding: '1rem' }}>Descripción</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Puntos</th>
                {isAdmin && <th style={{ padding: '1rem' }}></th>}
              </tr>
            </thead>
            <tbody>
              {pointLogs.slice().reverse().map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(log.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>{log.member}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{log.description}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '800', color: log.points > 0 ? '#10b981' : '#ef4444' }}>
                    {log.points > 0 ? `+${log.points}` : log.points}
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => deletePointLog(log.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                    </td>
                  )}
                </tr>
              ))}
              {pointLogs.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No hay registros de puntos aún.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
