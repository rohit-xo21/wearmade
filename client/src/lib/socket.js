import { io } from 'socket.io-client';
import api from '../api/axios';

let socketInstance = null;

function resolveServerUrl() {
  // api.defaults.baseURL like http://localhost:5000/api
  const base = api.defaults.baseURL || '';
  if (!base) return 'http://localhost:5000';
  try {
    const url = new URL(base);
    // strip trailing /api if present
    if (url.pathname.endsWith('/api')) {
      url.pathname = url.pathname.replace(/\/api$/, '');
    }
    return url.origin + url.pathname;
  } catch {
    return 'http://localhost:5000';
  }
}

export function getSocket() {
  const token = localStorage.getItem('accessToken');
  if (socketInstance && socketInstance.connected) return socketInstance;

  const serverUrl = import.meta.env.VITE_API_ORIGIN || resolveServerUrl();

  if (!socketInstance) {
    socketInstance = io(serverUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: token ? { token } : {}
    });
  } else {
    // update auth token if changed
    socketInstance.auth = token ? { token } : {};
    if (!socketInstance.connected) socketInstance.connect();
  }

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}


