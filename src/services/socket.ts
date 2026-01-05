import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(onConnect?: () => void) {
  if (socket) return socket;
  // server runs on same host at port 4000 in dev
  const url = `${location.protocol === 'https:' ? 'https' : 'http'}://${location.hostname}:4000`;
  socket = io(url, { transports: ['websocket'] });
  socket.on('connect', () => onConnect && onConnect());
  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

export function subscribeRoom(room: string) {
  if (!socket) return;
  socket.emit('subscribe', { room });
}

export function unsubscribeRoom(room: string) {
  if (!socket) return;
  socket.emit('unsubscribe', { room });
}

export function onPlaceUpdate(cb: (payload: any) => void) {
  if (!socket) return;
  socket.on('place:update', cb);
}

export function onPlacesUpdate(cb: (payload: any) => void) {
  if (!socket) return;
  socket.on('places:update', cb);
}

export function onPlacesInit(cb: (payload: any[]) => void) {
  if (!socket) return;
  socket.on('places:init', cb);
}

export function onAdminAlert(cb: (payload: any) => void) {
  if (!socket) return;
  socket.on('admin:alert', cb);
}

export function onPlaceAdminAlert(cb: (payload: any) => void) {
  if (!socket) return;
  socket.on('admin:alert', cb);
}