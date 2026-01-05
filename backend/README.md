# Smart Tourism Backend (MVP)

This is a minimal backend MVP for the Smart Tourism frontend.

Quick start (Windows):

1. cd backend
2. npm install
3. npm run dev

This starts an Express server on http://localhost:4000

Available endpoints (MVP):

- GET /api/places — list places with current crowd counts
- GET /api/places/:id — details for a place
- POST /api/ingest — body { place_id, count, timestamp } to simulate sensor events
- GET /api/places/:id/forecast?h=6 — simple forecast
- GET /api/places/:id/nearby — nearby places

Notes:
- Store and persistence are minimal (seeds in `src/data/places.json`).
- WebSocket support is available via socket.io and used for real-time broadcasts on ingestion (socket client is optional; the frontend polls by default).
- A simulator is included `src/simulate.ts` to generate random ingestion events: run it with `node --loader ts-node/esm src/simulate.ts` or `ts-node src/simulate.ts`.
- This is intentionally simple for local development and will be replaced with real streaming+DB in later sprints.
