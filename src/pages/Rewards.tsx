import { Award, TrendingUp, Trophy, Gift } from 'lucide-react';
import { useData } from '../context/DataContext';

const Rewards = () => {
  const { points, rewards } = useData();

  const badges = [
    { name: 'Master Limpiador', icon: '🧹', criteria: '10 tareas hechas', count: 8, total: 10, color: '#4f46e5' },
    { name: 'Cero Faltas', icon: '🎒', criteria: 'Mochila lista toda la semana', count: 5, total: 5, color: '#10b981', completed: true },
    { name: 'Gourmet Junior', icon: '🥗', criteria: 'Probar 3 alimentos nuevos', count: 1, total: 3, color: '#f59e0b' },
  ];

  const scoreboard = [
    { name: 'Sofía', pts: points.Sofía || 0, color: '#ec4899', trend: 'up' },
    { name: 'Mateo', pts: points.Mateo || 0, color: '#4f46e5', trend: 'stable' },
    { name: 'Papá', pts: 1200, color: '#64748b', trend: 'up' },
  ].sort((a, b) => b.pts - a.pts);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Premios y Competencia</h1>
        <p className="page-subtitle">Gana puntos, colecciona medallas y compite en familia</p>
      </header>

      <div className="grid">
        <div className="card">
          <h3 className="card-title"><Trophy size={20} color="#eab308" /> Tabla de Clasificación</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            {scoreboard.map((member, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: i === 0 ? '#fefce8' : '#f8fafc', borderRadius: '12px', border: i === 0 ? '1px solid #fef08a' : '1px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: '800', color: i === 0 ? '#ca8a04' : '#64748b', width: '20px' }}>{i + 1}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>{member.name[0]}</div>
                  <span style={{ fontWeight: '700' }}>{member.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '800' }}>{member.pts} pts</span>
                  {member.trend === 'up' && <TrendingUp size={16} color="#10b981" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title"><Award size={20} color="var(--p-primary)" /> Mis Medallas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {badges.map((badge, i) => (
              <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: badge.completed ? `2px solid ${badge.color}` : '1px solid #e2e8f0', opacity: badge.completed ? 1 : 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{badge.name}</span>
                  </div>
                  {badge.completed && <Award size={18} color={badge.color} fill={badge.color} />}
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(badge.count / badge.total) * 100}%`, height: '100%', background: badge.color, borderRadius: '4px' }}></div>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', marginTop: '0.4rem' }}>{badge.count}/{badge.total} - {badge.criteria}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 className="card-title"><Gift size={20} color="var(--p-primary)" /> Catálogo de Premios</h3>
        <div className="grid" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {rewards.map((reward) => (
            <div key={reward.id} style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', background: 'white' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>{reward.icon}</span>
              <p style={{ fontWeight: '700', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{reward.name}</p>
              <button style={{ 
                background: 'var(--p-primary)', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: '999px', 
                fontSize: '0.8rem', 
                fontWeight: '700',
                cursor: 'pointer',
                width: '100%'
              }}>
                Canjear {reward.cost} pts
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
