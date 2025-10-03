import { io } from 'socket.io-client';
import api from '../api/axios';

let socketInstance = null;

function resolveServerUrl() {
  // First try to get from environment variable
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    try {
      const url = new URL(envApiUrl);
      // strip trailing /api if present
      if (url.pathname.endsWith('/api')) {
        url.pathname = url.pathname.replace(/\/api$/, '');
      }
      return url.origin + url.pathname;
    } catch {
      // fallback to extracting from axios baseURL
    }
  }
  
  // Fallback: extract from api.defaults.baseURL
  const base = api.defaults.baseURL || '';
  if (!base) return import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  try {
    const url = new URL(base);
    // strip trailing /api if present
    if (url.pathname.endsWith('/api')) {
      url.pathname = url.pathname.replace(/\/api$/, '');
    }
    return url.origin + url.pathname;
  } catch {
    return import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
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


