import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001')
  .replace(/^ws:\/\//, 'http://')
  .replace(/^wss:\/\//, 'https://');

let socket: Socket | null = null;

export function getSocket(): Socket {
  const token = Cookies.get('accessToken');
  if (!socket || !socket.connected || socket.auth !== token) {
    if (socket) {
      socket.disconnect();
    }
    socket = io(`${WS_URL}/game`, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
