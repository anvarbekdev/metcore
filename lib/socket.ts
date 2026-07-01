'use client';
import { io, Socket } from 'socket.io-client';
import { useNotifStore } from './store';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket?.connected) return socket;

  socket = io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'}/notifications`, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('notification', (data) => {
    useNotifStore.getState().addNotification(data);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title, { body: data.body, icon: '/icon-192.png' });
    }
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
