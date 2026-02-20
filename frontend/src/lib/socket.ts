import { io, Socket } from 'socket.io-client';
import { API_BASE } from './api';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;
  socket = io(API_BASE, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
};
export const onNotification = (callback: (data: any) => void) => {
  if (socket) {
    socket.on("notification", callback);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
