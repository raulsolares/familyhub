import { useState } from 'react';
import type { FormEvent } from 'react';
import { UserPlus, Shield, Clock, Trash2, Edit2, List, X, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import type { Member, Rule, Routine, Chore } from '../context/DataContext';

const AVATARS = ['👦', '👧', '🧒', '👶', '👨', '👩', '🧔', '👱‍♀️', '👴', '👵', '🦸', '🧚', '🐶', '🐱', '🦄', '🐼'];

const Settings = () => {
  const { updateTheme } = useUser();
  const { 
    members, routines, chores, rules,
    addRule, deleteRule, 
    addRoutine, deleteRoutine, 
    addChore, deleteChore, updateMember, addMember,
  } = useData();

  type Tab = 'members' | 'rules' | 'routines' | 'chores';
  const [activeTab, setActiveTab] = useState<Tab>('members');

  // Miembros
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [mName, setMName] = useState('');
  const [mRole, setMRole] = useState<Member['role']>('child');
  const [mAvatar, setMAvatar] = useState(AVATARS[0]);
  const [mPin, setMPin] = useState('');

  const openMember = (m: Member | null) => {
    setEditingMember(m);
    setMName(m?.name || ''); setMRole(m?.role || 'child');
    setMAvatar(m?.avatar || AVATARS[0]); setMPin(m?.pin || '');
    setShowMemberForm(true);
  };

  const handleMemberSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pin = mPin.trim() || undefined;
    if (editingMember) {
      updateMember(editingMember.id, { avatar: mAvatar, pin });
    } else {
      if (members.some(m => m.name.toLowerCase() === mName.trim().toLowerCase())) return;
      addMember({ name: mName.trim(), role: mRole, avatar: mAvatar, pin });
    }
    setShowMemberForm(false);
  };

  // States for Routines
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [rName, setRName] = useState('');
  const [rTime, setRTime] = useState('08:00');
  const [rMember, setRMember] = useState('Alan');
  const [rIcon] = useState('☀️');
  const [rTasks, setRTasks] = useState<string[]>(['']);

  // States for Rules
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleDesc, setRuleDesc] = useState('');
  const [rulePoints, setRulePoints] = useState(0);

  // States for Chores
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [cName, setCName] = useState('');
  const [cUser, setCUser] = useState('Alan');
  const [cPoints, setCPoints] = useState(20);

  const handleRoutineSubmit = (e: FormEvent) => {
    e.preventDefault();
    addRoutine({ name: rName, time: rTime, member: rMember, icon: rIcon, tasks: rTasks.filter(t => t.trim() !== '') });
    setRName(''); setRTasks(['']); setShowRoutineForm(false);
  };

  const handleRuleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addRule({ description: ruleDesc, points: rulePoints, category: 'Conducta' });
    setRuleDesc(''); setRulePoints(0); setShowRuleForm(false);
  };

  const handleChoreSubmit = (e: FormEvent) => {
    e.preventDefault();
    addChore({ name: cName, user: cUser, points: cPoints, freq: 'Diario' });
    setCName(''); setShowChoreForm(false);
  };

  const addRTaskRow = () => setRTasks([...rTasks, '']);
  const updateRTaskRow = (idx: number, val: string) => {
    const next = [...rTasks]; next[idx] = val; setRTasks(next);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header">
        <h1 className="page-title">Configuración Maestro</h1>
        <p className="page-subtitle">Administra cada detalle de la logística familiar</p>
      </header>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontWeight: '700' }}>Tema Visual</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => updateTheme('light')} className="badge badge-blue" style={{ cursor: 'pointer', border: 'none' }}>Claro</button>
          <button onClick={() => updateTheme('dark')} className="badge" style={{ cursor: 'pointer', background: '#1e293b', color: 'white', border: 'none' }}>Oscuro</button>
          <button onClick={() => updateTheme('fun')} className="badge badge-pink" style={{ cursor: 'pointer', border: 'none' }}>Divertido</button>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'members', label: 'Familia', icon: UserPlus },
          { id: 'rules', label: 'Retos/Logros', icon: Shield },
          { id: 'routines', label: 'Bloques Rutina', icon: Clock },
          { id: 'chores', label: 'Tareas Hogar', icon: List },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '800',
            background: activeTab === tab.id ? 'var(--p-primary)' : 'var(--p-surface)',
            color: activeTab === tab.id ? 'white' : 'var(--p-text)',
            boxShadow: 'var(--shadow-premium)', whiteSpace: 'nowrap'
          }}><tab.icon size={18}/> {tab.label}</button>
        ))}
      </nav>

      {/* Miembros */}
      {activeTab === 'members' && (
        <div>
          <div className="grid">
            {members.map((m: Member) => (
              <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '3rem' }}>{m.avatar}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: '900' }}>{m.name}</h3>
                  <span className="badge badge-blue">{m.role === 'parent' ? 'Papá/Mamá' : 'Hijo/a'}</span>
                  <span className="text-xs text-muted" style={{ marginLeft: '0.5rem' }}>{m.pin ? '🔒 Con PIN' : 'Sin PIN'}</span>
                </div>
                <button onClick={() => openMember(m)} aria-label={`Editar ${m.name}`} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={18} color="var(--p-text-muted)"/></button>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => openMember(null)}><UserPlus size={15} /> Agregar miembro</button>

          {showMemberForm && (
            <div className="modal-overlay">
              <div className="modal-card" style={{ maxWidth: '420px' }}>
                <button className="modal-close" onClick={() => setShowMemberForm(false)}><X size={16} /></button>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>{editingMember ? `Editar a ${editingMember.name}` : 'Nuevo miembro'}</h3>
                <form onSubmit={handleMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {!editingMember && (
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Nombre *</label>
                        <input required value={mName} onChange={e => setMName(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Rol</label>
                        <select value={mRole} onChange={e => setMRole(e.target.value as Member['role'])}>
                          <option value="child">Hijo/a</option>
                          <option value="parent">Papá/Mamá</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Avatar</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {AVATARS.map(a => (
                        <button type="button" key={a} onClick={() => setMAvatar(a)} style={{ fontSize: '1.5rem', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', border: mAvatar === a ? '2px solid var(--p-primary)' : '1px solid var(--border)', background: mAvatar === a ? 'var(--p-primary-50)' : 'transparent' }}>{a}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN (4 a 6 números){(editingMember?.role ?? mRole) === 'child' ? ' · opcional' : ' *'}</label>
                    <input
                      inputMode="numeric" pattern="[0-9]{4,6}" maxLength={6}
                      required={(editingMember?.role ?? mRole) === 'parent'}
                      value={mPin} onChange={e => setMPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={(editingMember?.role ?? mRole) === 'child' ? 'Vacío = entra sin PIN' : '1234'}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}><Save size={15} /> Guardar</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rutinas */}
      {activeTab === 'routines' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h3 className="card-title">Bloques de Rutina por Miembro</h3>
             <button onClick={() => setShowRoutineForm(true)} className="btn-primary">+ Crear Bloque</button>
          </div>

          {showRoutineForm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                   <h3 style={{ fontWeight: '900' }}>Nueva Rutina</h3>
                   <button onClick={() => setShowRoutineForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X/></button>
                </div>
                <form onSubmit={handleRoutineSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '800' }}>Miembro</label>
                      <select value={rMember} onChange={e => setRMember(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        {members.map((m: Member) => <option key={m.id} value={m.name}>{m.name}</option>)}
                      </select>
                    </div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '800' }}>Hora Inicio</label><input type="time" value={rTime} onChange={e => setRTime(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} /></div>
                  </div>
                  <div><label style={{ fontSize: '0.8rem', fontWeight: '800' }}>Nombre Rutina</label><input required value={rName} onChange={e => setRName(e.target.value)} placeholder="Ej: Mañana, Escuela..." style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} /></div>
                  
                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Tareas de la Rutina <button type="button" onClick={addRTaskRow} style={{ border: 'none', background: 'none', color: 'var(--p-primary)', fontWeight: '900', cursor: 'pointer' }}>+ Añadir</button></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {rTasks.map((t, i) => (
                        <input key={i} value={t} onChange={e => updateRTaskRow(i, e.target.value)} placeholder={`Tarea ${i+1}`} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}>Guardar Rutina</button>
                </form>
              </div>
            </div>
          )}

          <div className="grid">
            {members.map((m: Member) => (
              <div key={m.id} className="card">
                <h3 className="card-title">{m.avatar} {m.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {routines.filter((r: Routine) => r.member === m.name).map((r: Routine) => (
                    <div key={r.id} style={{ padding: '1rem', background: 'var(--p-background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '900' }}>{r.icon} {r.name}</span>
                        <span className="badge badge-blue">{r.time}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--p-text-muted)', marginBottom: '1rem' }}>{r.tasks.length} actividades</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button onClick={() => deleteRoutine(r.id)} style={{ background: '#fef2f2', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', flex: 1, color: '#ef4444', fontWeight: '800' }}>Borrar</button>
                      </div>
                    </div>
                  ))}
                  {routines.filter((r: Routine) => r.member === m.name).length === 0 && <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--p-text-muted)' }}>Sin rutinas</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retos y Logros */}
      {activeTab === 'rules' && (
        <div className="card">
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
             <h3 className="card-title">Reglas de Convivencia</h3>
             <button onClick={() => setShowRuleForm(true)} className="btn-primary">+ Nueva Regla</button>
          </div>

          {showRuleForm && (
            <form onSubmit={handleRuleSubmit} style={{ background: 'var(--p-background)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 100px', gap: '1rem', alignItems: 'end' }}>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Descripción</label><input required value={ruleDesc} onChange={e => setRuleDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} /></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Puntos</label><input required type="number" value={rulePoints} onChange={e => setRulePoints(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} /></div>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem' }}><Save size={18}/></button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rules.map((r: Rule) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--p-background)', borderRadius: '12px', alignItems: 'center' }}>
                <span style={{ fontWeight: '700' }}>{r.description}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <span style={{ fontWeight: '900', color: r.points > 0 ? '#10b981' : '#ef4444' }}>{r.points > 0 ? `+${r.points}` : r.points}</span>
                   <button onClick={() => deleteRule(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#ef4444"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tareas Hogar */}
      {activeTab === 'chores' && (
        <div className="card">
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
             <h3 className="card-title">Responsabilidades del Hogar</h3>
             <button onClick={() => setShowChoreForm(true)} className="btn-primary">+ Añadir Tarea</button>
          </div>

          {showChoreForm && (
            <form onSubmit={handleChoreSubmit} style={{ background: 'var(--p-background)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Nombre</label><input required value={cName} onChange={e => setCName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} /></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Asignar</label>
                <select value={cUser} onChange={e => setCUser(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="Familia">Familia (Compartida)</option>
                  {members.map((m: Member) => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Puntos</label><input type="number" value={cPoints} onChange={e => setCPoints(Number(e.target.value))} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} /></div>
              <button type="submit" className="btn-primary" style={{ padding: '0.6rem' }}><Save size={18}/></button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {chores.map((c: Chore) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--p-background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                   <div style={{ fontWeight: '800' }}>{c.name}</div>
                   <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{c.user}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <span style={{ fontWeight: '900', color: '#10b981' }}>+{c.points}</span>
                   <button onClick={() => deleteChore(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#ef4444"/></button>
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
