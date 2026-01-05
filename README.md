# Smart Tourism Platform 🌍

A real-time crowd monitoring and smart trip planning platform for tourism destinations in India. This MVP provides live crowd data, AI-powered predictions, nearby alternatives, and admin controls.

## Features ✨

- **Live Crowd Monitoring** - Real-time crowd levels at popular destinations
- **Smart Trip Planner** - AI-optimized itineraries based on crowd predictions
- **Nearby Alternatives** - Find less crowded places when your destination is busy
- **Crowd Predictions** - Forecast crowd levels for better planning
- **Real-time Alerts** - Get notified about crowd surges and safety updates
- **Admin Dashboard** - Monitor and manage all destinations, send alerts
- **WebSocket Updates** - Instant updates without page refresh

## Quick Start 🚀

### Prerequisites
- Node.js 18+ (for native fetch support)
- npm

### Installation

```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

### Running the App

**Option 1: Run Everything Together (Recommended)**
```bash
npm run dev:all
```
This starts:
- Frontend at http://localhost:3000
- Backend API at http://localhost:4000
- Crowd simulator (generates live data)

**Option 2: Run Separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Simulator (optional, for demo data):
```bash
cd backend
npm run simulate
```

Terminal 3 - Frontend:
```bash
npm run dev
```

## Architecture 📐

```
├── src/                    # React Frontend
│   ├── components/         # UI Components
│   ├── services/           # API & Socket services
│   └── data/              # Mock data fallback
├── backend/               # Express Backend
│   ├── src/
│   │   ├── server.ts      # Main API server
│   │   └── simulate.ts    # Crowd data simulator
│   └── data/
│       └── places.json    # Destination database
```

## API Endpoints 📡

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/places` | GET | List all destinations with crowd data |
| `/api/places/:id` | GET | Get single destination details |
| `/api/places/:id/nearby` | GET | Find nearby alternatives |
| `/api/places/:id/forecast` | GET | Get crowd predictions |
| `/api/ingest` | POST | Ingest crowd observation data |
| `/api/admin/alerts` | GET | List all alerts |
| `/api/admin/alert` | POST | Send a new alert |
| `/api/admin/override` | POST | Override crowd count |

## WebSocket Events 🔌

- `places:init` - Initial snapshot of all places
- `places:update` - Single place crowd update
- `place:update` - Update for subscribed place
- `admin:alert` - New alert broadcast

## Screens 📱

1. **Splash Screen** - App loading
2. **Onboarding** - Welcome flow (tap logo 5x for admin)
3. **Home Dashboard** - Browse destinations, filters, search
4. **Destination Detail** - Full place info with live crowd
5. **Crowd Prediction** - AI-powered forecast charts
6. **Nearby Alternatives** - Less crowded options
7. **Trip Planner** - Create optimized itineraries
8. **Alerts** - View all notifications
9. **Profile** - User settings
10. **Admin Dashboard** - Control panel (hidden access)

## Admin Access 🔐

On the onboarding screen, tap the SmartTrip logo **5 times** to access the admin dashboard.

## Tech Stack 💻

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: Express.js, Socket.io
- **State**: React hooks with real-time WebSocket sync
- **UI**: Radix UI primitives, Lucide icons
  