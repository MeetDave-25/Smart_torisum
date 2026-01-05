export async function getPlaces() {
  try {
    const res = await fetch('/api/places');
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (e) {
    console.warn('Failed to fetch /api/places', e);
    return null;
  }
}

export async function getNearby(placeId: string) {
  try {
    const res = await fetch(`/api/places/${placeId}/nearby`);
    if (!res.ok) throw new Error('Failed to fetch nearby');
    return await res.json();
  } catch (e) {
    console.warn('Failed to fetch nearby', e);
    return [];
  }
}

export async function getForecast(placeId: string, h = 6) {
  try {
    const res = await fetch(`/api/places/${placeId}/forecast?h=${h}`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return await res.json();
  } catch (e) {
    console.warn('Failed fetch forecast', e);
    return null;
  }
}

// Admin API helpers
export async function sendAdminAlert(payload: { message: string; level?: string; place_id?: string | null }) {
  try {
    const res = await fetch('/api/admin/alert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return await res.json();
  } catch (e) {
    console.warn('Failed to send admin alert', e);
    return null;
  }
}

export async function sendAdminOverride(payload: { place_id: string; crowdCount?: number; crowdLevel?: string }) {
  try {
    const res = await fetch('/api/admin/override', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return await res.json();
  } catch (e) {
    console.warn('Failed to send override', e);
    return null;
  }
}

export async function getAdminAlerts() {
  try {
    const res = await fetch('/api/admin/alerts');
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function getAdminPlaces() {
  try {
    const res = await fetch('/api/admin/places');
    return await res.json();
  } catch (e) {
    return [];
  }
}
