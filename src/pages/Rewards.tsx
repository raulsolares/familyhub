import { useState } from 'react';
import { Award, TrendingUp, Trophy, History, Plus, Trash2, X, ShoppingBag, Star, CheckCircle, XCircle, Edit2, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { Rule, PointLog, Prize } from '../context/DataContext';

type Tab = 'scoreboard' | 'store' | 'history';

const Rewards = () => {
  const { user, role, viewMode } = useUser();
  const {
    points, pointLogs, rules, addPointLog, deletePointLog, members,
    prizes, prizeRequests, addPrize, updatePrize, deletePrize,
    addPrizeRequest, updatePrizeRequest, deletePrizeRequest,
  } = useData();

  const isKid = viewMode === 'child';
  const isParent = role === 'parent';

  const [tab, setTab] = useState<Tab>('scoreboard');

  // Apply rule form
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [applyMember, setApplyMember] = useState(members.find(m => m.role === 'child')?.name || '');
  const [applyRule, setApplyRule] = useState(rules[0]?.id || '');
  const [applyReason, setApplyReason] = useState('');

  // Prize form
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [prizeName, setPrizeName] = useState('');
  const [prizeDesc, setPrizeDesc] = useState('');
  const [prizePoints, setPrizePoints] = useState(100);
  const [prizeImage, setPrizeImage] = useState('');
  const [prizeAvailable, setPrizeAvailable] = useState(true);

  const handleApplyRule = (e: React.FormEvent) => {
    e.preventDefault();
    const rule = rules.find((r: Rule) => r.id === applyRule);
    if (rule && applyReason.trim()) {
      addPointLog({
        member: applyMember,
        description: `${rule.description}${applyReason ? ` — ${applyReason}` : ''}`,
        points: rule.points,
      });
      setShowRuleForm(false);
      setApplyReason('');
    }
  };

  const resetPrizeForm = () => {
    setEditingPrize(null); setPrizeName(''); setPrizeDesc('');
    setPrizePoints(100); setPrizeImage(''); setPrizeAvailable(true);
    setShowPrizeForm(false);
  };

  const startEditPrize = (p: Prize) => {
    setEditingPrize(p); setPrizeName(p.name); setPrizeDesc(p.description);
    setPrizePoints(p.points); setPrizeImage(p.imageUrl || ''); setPrizeAvailable(p.available);
    setShowPrizeForm(true);
  };

  const handlePrizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: prizeName, description: prizeDesc, points: prizePoints, imageUrl: prizeImage.trim(), available: prizeAvailable };
    if (editingPrize) updatePrize(editingPrize.id, data); else addPrize(data);
    resetPrizeForm();
  };

  const handleRequestPrize = (prize: Prize) => {
    if (!user) return;
    const myPoints = points[user.name] || 0;
    if (myPoints < prize.points) return;
    const alreadyPending = prizeRequests.some(r => r.prizeId === prize.id && r.member === user.name && r.status === 'pending');
    if (alreadyPending) return;
    addPrizeRequest({ member: user.name, prizeId: prize.id });
  };

  const scoreboard = members
    .map(m => ({ ...m, pts: points[m.name] || 0 }))
    .sort((a, b) => b.pts - a.pts);

  const pendingRequests = prizeRequests.filter(r => r.status === 'pending');
  const myPoints = points[user?.name || ''] || 0;

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Premios y Puntos</h1>
          <p className="page-subtitle">Reconocimientos, tienda y logros familiares</p>
        </div>
        {isParent && (
          <button className="btn-primary" onClick={() => setShowRuleForm(true)}>
            <Plus size={15} /> Aplicar Regla
          </button>
        )}
      </header>

      {/* Mis puntos (vista niño) */}
      {isKid && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--p-primary) 0%, #7c3aed 100%)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>{user?.avatar}</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600' }}>Mis puntos</p>
              <p style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', lineHeight: 1 }}>{myPoints} <span style={{ fontSize: '1rem' }}>pts</span></p>
            </div>
            <Star size={36} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
          </div>
        </div>
      )}

      {/* Alertas de solicitudes pendientes (padres) */}
      {isParent && pendingRequests.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--warning)', background: '#fffbeb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={18} color="var(--warning)" />
            <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>
              {pendingRequests.length} solicitud{pendingRequests.length > 1 ? 'es' : ''} de canje pendiente{pendingRequests.length > 1 ? 's' : ''}
            </p>
            <button className="btn-secondary" style={{ marginLeft: 'auto', fontSize: '0.8rem' }} onClick={() => setTab('store')}>
              Revisar
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab-btn${tab === 'scoreboard' ? ' active' : ''}`} onClick={() => setTab('scoreboard')}>
          <Trophy size={14} /> Clasificación
        </button>
        <button className={`tab-btn${tab === 'store' ? ' active' : ''}`} onClick={() => setTab('store')}>
          <ShoppingBag size={14} /> Tienda
          {isParent && pendingRequests.length > 0 && (
            <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '9999px', fontSize: '0.65rem', padding: '0 5px', fontWeight: '700', lineHeight: '16px', marginLeft: '4px' }}>
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button className={`tab-btn${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>
          <History size={14} /> Historial
        </button>
      </div>

      {/* ── CLASIFICACIÓN ── */}
      {tab === 'scoreboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Scoreboard */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
              <Trophy size={18} color="#eab308" /> Tabla de Clasificación
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {scoreboard.map((m, i) => {
                const maxPts = scoreboard[0]?.pts || 1;
                const pct = Math.min((m.pts / Math.max(maxPts, 500)) * 100, 100);
                return (
                  <div key={m.id} style={{
                    padding: '0.875rem 1rem',
                    background: i === 0 && m.pts > 0 ? 'var(--p-primary-50)' : 'var(--p-background)',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${i === 0 && m.pts > 0 ? 'var(--p-primary)' : 'var(--border)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? '#eab308' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2b' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', color: i < 3 ? '#fff' : 'var(--p-text-muted)', flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: '1.25rem' }}>{m.avatar}</span>
                      <span style={{ fontWeight: '700', flex: 1 }}>{m.name}</span>
                      <span style={{ fontWeight: '800', color: 'var(--p-primary)' }}>{m.pts} pts</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: i === 0 ? '#eab308' : 'var(--p-primary)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reglas activas */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Award size={18} color="var(--p-primary)" /> Reglas Activas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {rules.map((rule: Rule) => (
                <div key={rule.id} style={{ padding: '0.625rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{rule.description}</span>
                  <span style={{ fontWeight: '800', fontSize: '0.875rem', color: rule.points > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {rule.points > 0 ? `+${rule.points}` : rule.points} pts
                  </span>
                </div>
              ))}
              {rules.length === 0 && <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '1rem' }}>No hay reglas configuradas</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── TIENDA ── */}
      {tab === 'store' && (
        <div>
          {/* Solicitudes pendientes (padres) */}
          {isParent && pendingRequests.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--p-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Solicitudes pendientes ({pendingRequests.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingRequests.map(req => {
                  const prize = prizes.find(p => p.id === req.prizeId);
                  return (
                    <div key={req.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {prize?.imageUrl && (
                        <img src={prize.imageUrl} alt={prize.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius)', objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{prize?.name || 'Premio desconocido'}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                          <span className="badge badge-blue">{req.member}</span>
                          <span className="text-xs text-muted">• {prize?.points} pts</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          className="btn-primary"
                          style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            updatePrizeRequest(req.id, { status: 'approved' });
                            const prize = prizes.find(p => p.id === req.prizeId);
                            if (prize) {
                              addPointLog({ member: req.member, description: `Canje: ${prize.name}`, points: -prize.points });
                            }
                          }}
                        >
                          <CheckCircle size={14} /> Aprobar
                        </button>
                        <button
                          className="btn-icon"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => updatePrizeRequest(req.id, { status: 'rejected' })}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botón agregar premio (padres) */}
          {isParent && (
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowPrizeForm(true)}>
                <Plus size={14} /> Agregar premio
              </button>
            </div>
          )}

          {/* Grid de premios */}
          {prizes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <ShoppingBag size={36} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
                <h3 style={{ fontWeight: '700' }}>Tienda vacía</h3>
                <p>{isParent ? 'Agrega premios para que los niños puedan canjearlos' : 'Aún no hay premios disponibles'}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {prizes.map(prize => {
                const canAfford = myPoints >= prize.points;
                const myPending = prizeRequests.some(r => r.prizeId === prize.id && r.member === user?.name && r.status === 'pending');
                const myApproved = prizeRequests.some(r => r.prizeId === prize.id && r.member === user?.name && r.status === 'approved');

                return (
                  <div key={prize.id} className="card" style={{ padding: '0', overflow: 'hidden', opacity: !prize.available ? 0.5 : 1 }}>
                    {prize.imageUrl ? (
                      <img src={prize.imageUrl} alt={prize.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '100px', background: 'var(--p-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                        🎁
                      </div>
                    )}
                    <div style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontWeight: '700', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{prize.name}</p>
                      {prize.description && <p style={{ fontSize: '0.775rem', color: 'var(--p-text-muted)', marginBottom: '0.625rem' }}>{prize.description}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: '800', color: 'var(--p-primary)', fontSize: '1rem' }}>
                          <Star size={13} style={{ verticalAlign: 'middle', marginRight: '2px' }} />{prize.points} pts
                        </span>
                        {!prize.available && <span className="badge badge-gray">Agotado</span>}
                      </div>
                      {isKid ? (
                        myApproved ? (
                          <span className="badge badge-green" style={{ display: 'block', textAlign: 'center', padding: '0.5rem' }}>¡Aprobado!</span>
                        ) : myPending ? (
                          <span className="badge badge-yellow" style={{ display: 'block', textAlign: 'center', padding: '0.5rem' }}>Solicitud enviada</span>
                        ) : (
                          <button
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', opacity: !canAfford || !prize.available ? 0.5 : 1 }}
                            disabled={!canAfford || !prize.available}
                            onClick={() => handleRequestPrize(prize)}
                          >
                            {canAfford ? 'Canjear' : `Faltan ${prize.points - myPoints} pts`}
                          </button>
                        )
                      ) : (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button className="btn-icon" onClick={() => startEditPrize(prize)} style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', gap: '0.25rem' }}>
                            <Edit2 size={13} /> Editar
                          </button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deletePrize(prize.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mis solicitudes (niños) */}
          {isKid && prizeRequests.filter(r => r.member === user?.name).length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--p-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mis solicitudes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {prizeRequests.filter(r => r.member === user?.name).map(req => {
                  const prize = prizes.find(p => p.id === req.prizeId);
                  return (
                    <div key={req.id} style={{ padding: '0.75rem 1rem', background: 'var(--p-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <p style={{ fontWeight: '600', fontSize: '0.875rem', flex: 1 }}>{prize?.name || '—'}</p>
                      <span className={`badge ${req.status === 'approved' ? 'badge-green' : req.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                        {req.status === 'approved' ? 'Aprobado' : req.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                      </span>
                      {req.status !== 'pending' && (
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deletePrizeRequest(req.id)}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORIAL ── */}
      {tab === 'history' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <History size={18} color="var(--p-primary)" /> Historial de puntos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pointLogs.length === 0 && (
              <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '2rem' }}>No hay registros aún</p>
            )}
            {[...pointLogs].reverse().map((log: PointLog) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius)', background: log.points > 0 ? '#f0fdf4' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={16} color={log.points > 0 ? 'var(--success)' : 'var(--danger)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{log.description}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', marginTop: '0.1rem' }}>
                    {log.member} · {new Date(log.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span style={{ fontWeight: '800', fontSize: '0.9rem', color: log.points > 0 ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }}>
                  {log.points > 0 ? `+${log.points}` : log.points}
                </span>
                {isParent && (
                  <button className="btn-icon" style={{ color: 'var(--danger)', flexShrink: 0 }} onClick={() => deletePointLog(log.id)}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Aplicar Regla */}
      {showRuleForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close" onClick={() => { setShowRuleForm(false); setApplyReason(''); }}><X size={16} /></button>
            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.25rem' }}>Aplicar Regla</h3>
            <form onSubmit={handleApplyRule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Para</label>
                <select value={applyMember} onChange={e => setApplyMember(e.target.value)}>
                  {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Regla</label>
                <select value={applyRule} onChange={e => setApplyRule(e.target.value)}>
                  {rules.map((r: Rule) => (
                    <option key={r.id} value={r.id}>{r.description} ({r.points > 0 ? `+${r.points}` : r.points} pts)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Motivo o contexto *</label>
                <input
                  required
                  value={applyReason}
                  onChange={e => setApplyReason(e.target.value)}
                  placeholder="Ej: Por lavar los trastes sin que se lo pidieran"
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', marginTop: '0.25rem' }}>
                  El motivo es obligatorio para el historial
                </p>
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                Aplicar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agregar/Editar Premio */}
      {showPrizeForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close" onClick={resetPrizeForm}><X size={16} /></button>
            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              {editingPrize ? 'Editar premio' : 'Nuevo premio'}
            </h3>
            <form onSubmit={handlePrizeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input required value={prizeName} onChange={e => setPrizeName(e.target.value)} placeholder="Ej: Noche de película" />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input value={prizeDesc} onChange={e => setPrizeDesc(e.target.value)} placeholder="Detalles del premio..." />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Puntos necesarios *</label>
                  <input required type="number" min="1" value={prizePoints} onChange={e => setPrizePoints(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Disponible</label>
                  <select value={prizeAvailable ? 'si' : 'no'} onChange={e => setPrizeAvailable(e.target.value === 'si')}>
                    <option value="si">Sí</option>
                    <option value="no">No (agotado)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">URL de imagen (opcional)</label>
                <input value={prizeImage} onChange={e => setPrizeImage(e.target.value)} placeholder="https://..." />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                {editingPrize ? 'Guardar cambios' : 'Crear premio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
