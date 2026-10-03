import { useState } from 'react';
import type { FormEvent } from 'react';
import { UserPlus, Shield, Trash2, Edit2, X, Save, Bell, Sun, Moon } from 'lucide-react';
import NotificationSettings from '../components/NotificationSettings';
import { useData } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import type { Member, Rule } from '../context/DataContext';

const AVATARS = ['👦', '👧', '🧒', '👶', '👨', '👩', '🧔', '👱‍♀️', '👴', '👵', '🦸', '🧚', '🐶', '🐱', '🦄', '🐼'];

const Settings = () => {
  const { updateTheme, user } = useUser();
  const theme = user?.theme;
  const { 
    members, rules,
    addRule, deleteRule,
    updateMember, addMember,
  } = useData();

  type Tab = 'members' | 'rules' | 'notifications';
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

  // States for Rules
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleDesc, setRuleDesc] = useState('');
  const [rulePoints, setRulePoints] = useState(0);

  const handleRuleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addRule({ description: ruleDesc, points: rulePoints, category: 'Conducta' });
    setRuleDesc(''); setRulePoints(0); setShowRuleForm(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Familia, retos y notificaciones. Rutinas y tareas se editan en su propia sección.</p>
        </div>
        <div className="seg" role="group" aria-label="Tema">
          <button className={theme !== 'dark' ? 'on' : ''} onClick={() => updateTheme('light')}><Sun size={13} style={{ verticalAlign: '-2px' }} /> Claro</button>
          <button className={theme === 'dark' ? 'on' : ''} onClick={() => updateTheme('dark')}><Moon size={13} style={{ verticalAlign: '-2px' }} /> Oscuro</button>
        </div>
      </header>

      <div className="member-tabs" role="tablist" style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'members', label: 'Familia', icon: UserPlus },
          { id: 'rules', label: 'Retos y logros', icon: Shield },
          { id: 'notifications', label: 'Notificaciones', icon: Bell },
        ].map(tab => (
          <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={`member-tab${activeTab === tab.id ? ' on' : ''}`} onClick={() => setActiveTab(tab.id as Tab)}>
            <tab.icon size={15} style={{ verticalAlign: '-3px' }} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'notifications' && <NotificationSettings />}

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

    </div>
  );
};

export default Settings;
