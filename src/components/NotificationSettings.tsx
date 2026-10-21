import { useState } from 'react';
import { Bell, BellOff, Send, Smartphone, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import { usePush } from '../hooks/usePush';
import { notify } from '../utils/push';

const WHAT_ARRIVES = [
  ['Papás', 'Un niño pide un premio, termina sus misiones; resumen a las 7:00 (agenda, escuela, premios) y a las 19:30 (lo de mañana, menús sin elegir).'],
  ['Niños', 'Sus misiones del día por la mañana, recordatorio de racha por la tarde y cuando aprueban su premio o les dan puntos.'],
];

const NotificationSettings = () => {
  const { members, pushSubscriptions, removePushSubscription } = useData();
  const { user } = useUser();
  const push = usePush();
  const [forMember, setForMember] = useState(user?.name || members[0]?.name || '');
  const [testSent, setTestSent] = useState(false);

  const thisDeviceOwner = push.record?.member;

  const sendTest = () => {
    if (!thisDeviceOwner) return;
    notify({ to: [thisDeviceOwner], title: '🔔 Prueba de FamilyHub', body: '¡Las notificaciones funcionan en este dispositivo!', url: '/settings', tag: 'test' });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 720 }}>
      {!push.configured && (
        <div className="notice warn">
          <BellOff size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <b>Falta configurar el servidor.</b> Las notificaciones necesitan Firebase y las llaves VAPID en Vercel
            (<code>VITE_VAPID_PUBLIC_KEY</code>, <code>VAPID_PUBLIC_KEY</code>, <code>VAPID_PRIVATE_KEY</code>). Mientras tanto la app funciona igual, sin avisos.
          </div>
        </div>
      )}
      {push.configured && !push.supported && (
        <div className="notice warn">
          <Smartphone size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>Este navegador no soporta notificaciones. En iPhone o iPad, abre la app en Safari, toca <b>Compartir → Agregar a inicio</b> y ábrela desde ese ícono.</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-head"><h3>Este dispositivo</h3></div>
        <div className="panel-body" style={{ display: 'grid', gap: '0.75rem' }}>
          {thisDeviceOwner ? (
            <>
              <p className="text-sm">Recibe las notificaciones de <b>{thisDeviceOwner}</b>.</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={sendTest} disabled={testSent}><Send size={14} /> {testSent ? 'Enviada' : 'Enviar prueba'}</button>
                <button className="btn-secondary" onClick={push.disable} disabled={push.busy}><BellOff size={14} /> Desactivar aquí</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">¿De quién es este dispositivo? Si es la tablet de un niño, elígelo para que le lleguen sus recordatorios.</p>
              <div className="seg" style={{ alignSelf: 'start', flexWrap: 'wrap' }}>
                {members.map(m => (
                  <button key={m.id} className={forMember === m.name ? 'on' : ''} onClick={() => setForMember(m.name)}>{m.avatar} {m.name}</button>
                ))}
              </div>
              <div>
                <button className="btn-primary" onClick={() => push.enable(forMember)} disabled={push.busy || !push.supported || !push.configured || push.permission === 'denied'}>
                  <Bell size={14} /> {push.busy ? 'Activando…' : `Activar para ${forMember}`}
                </button>
              </div>
              {push.permission === 'denied' && <p className="text-sm" style={{ color: 'var(--danger)' }}>Bloqueaste las notificaciones en este navegador. Actívalas en los ajustes del sitio y vuelve a intentar.</p>}
            </>
          )}
          {push.error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{push.error}</p>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Dispositivos registrados</h3><span className="text-sm text-muted">{pushSubscriptions.length}</span></div>
        <div className="panel-body">
          {pushSubscriptions.length === 0
            ? <p className="text-sm text-muted">Aún no hay dispositivos. Activa las notificaciones en el celular de cada quien.</p>
            : (
              <ul className="device-list">
                {pushSubscriptions.map(s => {
                  const m = members.find(x => x.name === s.member);
                  return (
                    <li key={s.id}>
                      <b>{m?.avatar} {s.member}</b>
                      <span>{s.device}{s.endpoint === push.endpoint ? ' · este' : ''}<br /><small>desde {new Date(s.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</small></span>
                      <button className="btn-icon" aria-label={`Quitar ${s.device} de ${s.member}`} onClick={() => removePushSubscription(s.endpoint)}><Trash2 size={15} /></button>
                    </li>
                  );
                })}
              </ul>
            )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Qué avisos llegan</h3></div>
        <div className="panel-body" style={{ display: 'grid', gap: '0.5rem' }}>
          {WHAT_ARRIVES.map(([who, what]) => (
            <p key={who} className="text-sm"><b>{who}:</b> <span className="text-muted">{what}</span></p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
