import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
app.use(cors());
app.use(bodyParser.json());

const DATA_PATH = path.join(__dirname, '..', 'data', 'places.json');
let places: any[] = [];
try {
  places = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
} catch (e) {
  console.error('Failed to load places seed', e);
  places = [];
}

// Basic helpers
const getCrowdLevel = (count: number, cap: number) => {
  const p = (count / cap) * 100;
  if (p > 75) return 'high';
  if (p > 35) return 'medium';
  return 'low';
};

// In-memory observations store (for simple MVP)
const observations: Record<string, { ts: number; count: number }[]> = {};
// In-memory alerts store
const alerts: any[] = [];

app.get('/api/places', (req, res) => {
  const enriched = places.map(p => ({
    ...p,
    crowdLevel: getCrowdLevel(p.crowdCount, p.capacity),
  }));
  res.json(enriched);
});

app.get('/api/places/:id', (req, res) => {
  const id = req.params.id;
  const p = places.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  p.crowdLevel = getCrowdLevel(p.crowdCount, p.capacity);
  res.json(p);
});

// Ingest endpoint: accept { place_id, count, timestamp } - merges into current count
app.post('/api/ingest', (req, res) => {
  const { place_id, count, timestamp } = req.body;
  const p = places.find(x => x.id === place_id);
  if (!p) return res.status(404).json({ error: 'Place not found' });
  const ts = timestamp ? new Date(timestamp).getTime() : Date.now();
  const c = Number(count);
  // store observation
  observations[place_id] = observations[place_id] || [];
  observations[place_id].push({ ts, count: c });
  // naive merge: use latest sliding average
  const window = observations[place_id].slice(-5);
  const avg = Math.round(window.reduce((s, o) => s + o.count, 0) / window.length);
  p.crowdCount = avg;
  p.crowdLevel = getCrowdLevel(p.crowdCount, p.capacity);
  // persist to disk (basic)
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(places, null, 2));
  } catch (e) {
    console.warn('Failed to persist places', e);
  }
  // broadcast to specific rooms (place and places list)
  io.to(`place:${p.id}`).emit('place:update', { id: p.id, crowdCount: p.crowdCount, crowdLevel: p.crowdLevel });
  io.to('places').emit('places:update', { id: p.id, crowdCount: p.crowdCount, crowdLevel: p.crowdLevel });
  res.json({ ok: true, place: p });
});

// Forecast - trivial moving average forecast for next `h` hours
app.get('/api/places/:id/forecast', (req, res) => {
  const id = req.params.id;
  const h = Number(req.query.h || 6);
  const p = places.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const obs = (observations[id] || []).slice(-24);
  // if no obs, use current count
  const last = p.crowdCount || 0;
  const avg = obs.length ? Math.round(obs.reduce((s, o) => s + o.count, 0) / obs.length) : last;
  const result = [] as any[];
  for (let i = 1; i <= h; i++) {
    // simple persistence: predict same as avg with small noise
    const predicted = Math.max(0, Math.round(avg * (1 + (Math.sin(i) * 0.05))));
    result.push({ hour: i, predictedCount: predicted, crowdLevel: getCrowdLevel(predicted, p.capacity) });
  }
  res.json({ placeId: id, forecast: result });
});

// Nearby - naive: sort by haversine distance, return up to 5
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.get('/api/places/:id/nearby', (req, res) => {
  const id = req.params.id;
  const radius = Number(req.query.radius || 10);
  const p = places.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const results = places
    .filter(x => x.id !== id && x.lat && x.lng)
    .map(x => ({ place: x, dist: haversine(p.lat, p.lng, x.lat, x.lng) }))
    .filter(x => x.dist <= radius)
    .sort((a, b) => a.dist - b.dist || a.place.crowdCount - b.place.crowdCount)
    .slice(0, 5)
    .map(x => ({ ...x.place, distanceKm: x.dist }));
  res.json(results);
});

// Admin: list alerts
app.get('/api/admin/alerts', (req, res) => {
  res.json(alerts);
});

// Admin: raise an alert (broadcast to alerts room and optionally to a place room)
app.post('/api/admin/alert', (req, res) => {
  const { message, level = 'info', place_id } = req.body;
  const alert = { id: `${Date.now()}`, message, level, place_id: place_id || null, ts: Date.now() };
  alerts.push(alert);
  io.to('alerts').emit('admin:alert', alert);
  if (place_id) io.to(`place:${place_id}`).emit('admin:alert', alert);
  res.json({ ok: true, alert });
});

// Admin: override place (manual update)
app.post('/api/admin/override', (req, res) => {
  const { place_id, crowdCount, crowdLevel } = req.body;
  const p = places.find(x => x.id === place_id);
  if (!p) return res.status(404).json({ error: 'Place not found' });
  if (typeof crowdCount === 'number') p.crowdCount = crowdCount;
  if (crowdLevel) p.crowdLevel = crowdLevel;
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(places, null, 2));
  } catch (e) {
    console.warn('Failed to persist places', e);
  }
  io.to(`place:${place_id}`).emit('place:update', { id: p.id, crowdCount: p.crowdCount, crowdLevel: p.crowdLevel });
  io.to('places').emit('places:update', { id: p.id, crowdCount: p.crowdCount, crowdLevel: p.crowdLevel });
  res.json({ ok: true, place: p });
});

// Admin: list places (admin view)
app.get('/api/admin/places', (req, res) => {
  res.json(places);
});

// socket connection with room support
io.on('connection', (socket) => {
  console.log('ws connected', socket.id);

  socket.on('subscribe', (payload) => {
    const room = typeof payload === 'string' ? payload : payload?.room;
    if (!room) return;
    socket.join(room);
    console.log(`socket ${socket.id} joined ${room}`);
    // send initial data for some rooms
    if (room === 'places') {
      const snapshot = places.map(p => ({ id: p.id, crowdCount: p.crowdCount, crowdLevel: getCrowdLevel(p.crowdCount, p.capacity) }));
      socket.emit('places:init', snapshot);
    }
  });

  socket.on('unsubscribe', (payload) => {
    const room = typeof payload === 'string' ? payload : payload?.room;
    if (!room) return;
    socket.leave(room);
    console.log(`socket ${socket.id} left ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('ws disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Backend MVP running on http://localhost:${PORT}`));
