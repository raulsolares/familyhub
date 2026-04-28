import { useState } from 'react';
import type { FormEvent } from 'react';
import { UserPlus, Shield, Clock, Trash2, Edit2, List, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import type { Member, Rule, Routine, Chore } from '../context/DataContext';

const Settings = () => {
  const { updateTheme } = useUser();
  const { 
    members, rules, routines, chores, 
    addRule, updateRule, deleteRule, 
    deleteRoutine, 
    addChore, deleteChore, updateMember 
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'members' | 'rules' | 'routines' | 'chores'>('members');
  
  // Form states
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleDesc, setRuleDesc] = useState('');
  const [rulePoints, setRulePoints] = useState(0);
  const [ruleCat, setRuleCat] = useState('Conducta');

  const [showChoreForm, setShowChoreForm] = useState(false);
  const [choreName, setChoreName] = useState('');
  const [choreUser, setChoreUser] = useState('Alan');
  const [chorePoints, setChorePoints] = useState(20);
  const [choreFreq] = useState('Diario');

  const handleRuleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = { description: ruleDesc, points: rulePoints, category: ruleCat };
    if (editingRule) updateRule(editingRule.id, payload);
    else addRule(payload);
    
    setRuleDesc(''); setRulePoints(0); setEditingRule(null); setShowRuleForm(false);
  };

  const handleAddChore = (e: FormEvent) => {
    e.preventDefault();
    addChore({ name: choreName, user: choreUser, points: chorePoints, freq: choreFreq });
    setChoreName('');
    setShowChoreForm(false);
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Configuración Maestro</h1>
        <p className="page-subtitle">Administra miembros, reglas de convivencia y rutinas familiares</p>
      </header>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        <span style={{ fontWeight: '700' }}>Tema Visual de tu Sesión</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => updateTheme('light')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: '#1e293b', fontWeight: '700', cursor: 'pointer' }}>Claro</button>
          <button onClick={() => updateTheme('dark')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#1e293b', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Oscuro</button>
          <button onClick={() => updateTheme('fun')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#f43f5e', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Divertido</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'members', label: 'Miembros', icon: UserPlus },
          { id: 'rules', label: 'Retos y Logros', icon: Shield },
          { id: 'routines', label: 'Rutinas', icon: Clock },
          { id: 'chores', label: 'Tareas Hogar', icon: List },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
              borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700',
              background: activeTab === tab.id ? 'var(--p-primary)' : 'white',
              color: activeTab === tab.id ? 'white' : 'var(--p-text)',
              boxShadow: 'var(--shadow-premium)',
              whiteSpace: 'nowrap'
            }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Gestión de Miembros */}
      {activeTab === 'members' && (
        <div className="grid">
          {members.map((m: Member) => (
            <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2.5rem' }}>{m.avatar}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '800' }}>{m.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--p-text-muted)' }}>Rol: {m.role === 'parent' ? 'Administrador' : 'Hijo'}</p>
              </div>
              <button onClick={() => updateMember(m.id, {})} className="btn-primary" style={{ padding: '0.5rem' }}><Edit2 size={14}/></button>
            </div>
          ))}
        </div>
      )}

      {/* Gestión de Reglas */}
      {activeTab === 'rules' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Reglas de Puntaje</h3>
            <button onClick={() => { setEditingRule(null); setShowRuleForm(true); }} className="btn-primary">+ Nueva Regla</button>
          </div>

          {showRuleForm && (
            <form onSubmit={handleRuleSubmit} style={{ background: 'var(--p-background)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', gap: '1rem', alignItems: 'end' }}>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Descripción</label><input required value={ruleDesc} onChange={e => setRuleDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} /></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Puntos</label><input required type="number" value={rulePoints} onChange={e => setRulePoints(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} /></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Categoría</label><select value={ruleCat} onChange={e => setRuleCat(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}><option>Comida</option><option>Hogar</option><option>Conducta</option><option>Escuela</option></select></div>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem' }}><Save size={18}/></button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rules.map((r: Rule) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--p-background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontWeight: '700' }}>{r.description}</span>
                  <span style={{ marginLeft: '1rem', fontSize: '0.7rem', color: 'var(--p-text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>{r.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: '800', color: r.points > 0 ? '#10b981' : '#ef4444' }}>{r.points > 0 ? `+${r.points}` : r.points} pts</span>
                  <button onClick={() => deleteRule(r.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gestión de Rutinas */}
      {activeTab === 'routines' && (
        <div className="grid">
          {members.map((m: Member) => (
            <div key={m.id} className="card">
              <h3 className="card-title">{m.avatar} Rutina de {m.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {routines.filter((r: Routine) => r.member === m.name).map((r: Routine) => (
                  <div key={r.id} style={{ padding: '0.75rem', background: 'var(--p-background)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{r.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>{r.time}</p>
                    </div>
                    <button onClick={() => deleteRoutine(r.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14}/></button>
                  </div>
                ))}
                <button className="btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem', background: 'none', border: '1px dashed var(--p-primary)', color: 'var(--p-primary)' }}>+ Agregar Bloque</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gestión de Tareas */}
      {activeTab === 'chores' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Tareas del Hogar Configuradas</h3>
            <button onClick={() => setShowChoreForm(true)} className="btn-primary">+ Nueva Tarea</button>
          </div>

          {showChoreForm && (
            <form onSubmit={handleAddChore} style={{ background: 'var(--p-background)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Nombre</label><input required value={choreName} onChange={e => setChoreName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} /></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Asignar</label>
                <select value={choreUser} onChange={e => setChoreUser(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="Familia">Familia (Compartida)</option>
                  {members.map((m: Member) => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Puntos</label><input type="number" value={chorePoints} onChange={e => setChorePoints(Number(e.target.value))} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} /></div>
              <button type="submit" className="btn-primary" style={{ padding: '0.6rem' }}><Save size={18}/></button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {chores.map((c: Chore) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--p-background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontWeight: '700' }}>{c.name}</span>
                  <span style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'white', background: 'var(--p-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{c.user}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: '800', color: '#10b981' }}>+{c.points} pts</span>
                  <button onClick={() => deleteChore(c.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
