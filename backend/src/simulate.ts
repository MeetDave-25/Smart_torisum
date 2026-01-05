import fs from 'fs';
import path from 'path';
// Using global fetch provided by modern Node.js runtime (v18+). If using older node, install a fetch polyfill.

const DATA_PATH = path.join(__dirname, '..', 'data', 'places.json');
let places = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Alert messages for demo
const alertMessages = [
  { message: '⚠️ High crowd detected at Taj Mahal - consider visiting later', level: 'warning' },
  { message: '🚨 Capacity limit approaching at Tirupati Temple', level: 'critical' },
  { message: '✅ Golden Temple crowd levels have decreased - good time to visit!', level: 'info' },
  { message: '🌡️ Heat advisory: Stay hydrated when visiting outdoor monuments', level: 'warning' },
  { message: '🎉 Festival season: Expect higher crowds at temples this week', level: 'info' },
  { message: '🚧 Partial closure at Red Fort due to maintenance', level: 'warning' },
  { message: '📍 New parking available at Qutub Minar complex', level: 'info' },
];

// Time-based crowd patterns (hour of day -> multiplier)
function getTimeMultiplier(): number {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 9) return 0.5;  // Early morning - low
  if (hour >= 9 && hour < 12) return 0.8; // Morning - medium
  if (hour >= 12 && hour < 15) return 1.0; // Afternoon peak
  if (hour >= 15 && hour < 18) return 0.9; // Late afternoon
  if (hour >= 18 && hour < 21) return 0.7; // Evening
  return 0.3; // Night - very low
}

async function sendCrowdUpdate() {
  try {
    const p = places[Math.floor(Math.random() * places.length)];
    const timeMultiplier = getTimeMultiplier();
    
    // Random walk with time-based adjustment
    const delta = Math.round((Math.random() - 0.5) * p.capacity * 0.08);
    const baseCrowd = p.capacity * timeMultiplier * (0.3 + Math.random() * 0.4);
    const newCount = Math.max(0, Math.min(p.capacity, Math.round(baseCrowd + delta)));
    
    console.log(`📊 Updating ${p.name}: ${newCount} visitors`);
    
    await fetch('http://localhost:4000/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: p.id, count: newCount })
    });
  } catch (e) {
    console.warn('Failed to send crowd update', e);
  }
}

async function sendRandomAlert() {
  try {
    const alertTemplate = alertMessages[Math.floor(Math.random() * alertMessages.length)];
    const randomPlace = Math.random() > 0.5 ? places[Math.floor(Math.random() * places.length)] : null;
    
    const alert = {
      message: alertTemplate.message,
      level: alertTemplate.level,
      place_id: randomPlace?.id || null
    };
    
    console.log(`🔔 Sending alert: ${alert.message}`);
    
    await fetch('http://localhost:4000/api/admin/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  } catch (e) {
    console.warn('Failed to send alert', e);
  }
}

async function run() {
  console.log('🚀 Starting Smart Tourism Simulator');
  console.log(`📍 Monitoring ${places.length} destinations`);
  console.log('-----------------------------------');
  
  // Send crowd updates every 3-5 seconds
  setInterval(sendCrowdUpdate, 3000 + Math.random() * 2000);
  
  // Send alerts every 20-40 seconds
  setInterval(sendRandomAlert, 20000 + Math.random() * 20000);
  
  // Initial update
  sendCrowdUpdate();
}

run();
