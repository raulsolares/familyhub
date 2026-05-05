import { useEffect, useRef } from 'react';
import type { SchoolTask } from '../context/DataContext';

export const useNotifications = (schoolTasks: SchoolTask[]) => {
  const scheduledRef = useRef<Set<string>>(new Set());

  const requestPermission = async () => {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  };

  const sendNotification = (title: string, body: string, url = '/school') => {
    if (Notification.permission !== 'granted') return;
    const n = new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `fh-${Date.now()}`,
    });
    n.onclick = () => { window.focus(); window.location.hash = url; n.close(); };
  };

  useEffect(() => {
    if (Notification.permission !== 'granted') return;

    const today = new Date(); today.setHours(0, 0, 0, 0);

    schoolTasks.filter(t => !t.completed).forEach(task => {
      const key = `${task.id}-${task.eventDate}`;
      if (scheduledRef.current.has(key)) return;

      const eventDate = new Date(task.eventDate + 'T12:00');
      const daysLeft = Math.ceil((eventDate.getTime() - today.getTime()) / 86400000);

      if (daysLeft === 0) {
        scheduledRef.current.add(key);
        sendNotification(`📅 Hoy: ${task.title}`, `${task.child} tiene un evento hoy (${task.category})`);
      } else if (daysLeft === 1) {
        scheduledRef.current.add(key);
        sendNotification(`⏰ Mañana: ${task.title}`, `${task.child} tiene un evento mañana (${task.category})`);
      } else if (daysLeft === 3) {
        scheduledRef.current.add(key);
        sendNotification(`📌 En 3 días: ${task.title}`, `${task.child} · ${task.category}`);
      }
    });
  }, [schoolTasks]);

  return { requestPermission, sendNotification };
};
