export type LocationOption = {
  name: string;
  state: string;
  lat: number;
  lon: number;
  nearbyHub?: string;
};

export const POPULAR_LOCATIONS: LocationOption[] = [
  { name: "Batim", state: "Goa (Tiswadi)", lat: 15.46, lon: 73.88, nearbyHub: "Goa Velha" },
  { name: "Goa Velha", state: "Goa", lat: 15.44, lon: 73.88, nearbyHub: "Panaji" },
  { name: "Goa (Panaji)", state: "Goa", lat: 15.49, lon: 73.82 },
  { name: "Goa (Margao)", state: "Goa", lat: 15.27, lon: 73.96 },
  { name: "Goa (Mapusa)", state: "Goa", lat: 15.60, lon: 73.81 },
  { name: "Goa (Ponda)", state: "Goa", lat: 15.40, lon: 74.02 },
  { name: "Goa (Vasco)", state: "Goa", lat: 15.40, lon: 73.83 },
  { name: "Pune", state: "Maharashtra", lat: 18.52, lon: 73.86 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.08, lon: 72.88 },
  { name: "Nashik", state: "Maharashtra", lat: 20.00, lon: 73.79 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.14, lon: 79.08 },
  { name: "Kolhapur", state: "Maharashtra", lat: 16.70, lon: 74.23 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.97, lon: 77.59 },
  { name: "Hyderabad", state: "Telangana", lat: 17.38, lon: 78.48 },
  { name: "Delhi NCR", state: "Delhi", lat: 28.61, lon: 77.21 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.08, lon: 80.27 },
  { name: "Kolkata", state: "West Bengal", lat: 22.57, lon: 88.36 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.91, lon: 75.78 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.02, lon: 72.57 },
  { name: "Surat", state: "Gujarat", lat: 21.17, lon: 72.83 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.71, lon: 75.85 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.25, lon: 77.41 },
  { name: "Chandigarh", state: "Punjab", lat: 30.73, lon: 76.78 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.84, lon: 80.94 },
  { name: "Kochi", state: "Kerala", lat: 9.93, lon: 76.26 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.01, lon: 76.95 },
  { name: "Patna", state: "Bihar", lat: 25.59, lon: 85.13 },
  { name: "Guwahati", state: "Assam", lat: 26.14, lon: 91.73 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.31, lon: 78.03 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.10, lon: 77.17 },
];

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestKnownLocation(
  lat: number,
  lon: number,
  excludeSelfName?: string,
): { location: LocationOption; distanceKm: number } | null {
  let nearest: LocationOption | null = null;
  let minDistance = Infinity;

  for (const loc of POPULAR_LOCATIONS) {
    if (
      excludeSelfName &&
      loc.name.toLowerCase() === excludeSelfName.toLowerCase()
    ) {
      continue;
    }
    const dist = calculateDistanceKm(lat, lon, loc.lat, loc.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc;
    }
  }

  if (nearest) {
    return { location: nearest, distanceKm: minDistance };
  }
  return null;
}

export async function reverseGeocodeCoords(
  lat: number,
  lon: number,
): Promise<{ label: string; details?: string }> {
  // 1. Calculate nearest known hub offline
  const nearest = findNearestKnownLocation(lat, lon);
  let fallbackLabel = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  let fallbackDetails = "";

  if (nearest) {
    const dist = Math.round(nearest.distanceKm);
    if (dist < 3) {
      fallbackLabel = nearest.location.name;
      fallbackDetails = nearest.location.state;
    } else {
      fallbackLabel = `Near ${nearest.location.name}`;
      fallbackDetails = `~${dist} km from ${nearest.location.name}`;
    }
  }

  // 2. Try online reverse geocoding via OpenStreetMap Nominatim for exact local village/town
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: { "Accept-Language": "en" },
        signal: AbortSignal.timeout(3500),
      },
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const localName =
        addr.village ||
        addr.suburb ||
        addr.town ||
        addr.city ||
        addr.county ||
        data.name;

      if (localName) {
        if (nearest && nearest.location.name.toLowerCase() !== localName.toLowerCase()) {
          const dist = Math.round(nearest.distanceKm);
          return {
            label: localName,
            details: dist <= 20 ? `Near ${nearest.location.name} (${dist} km)` : (addr.state || addr.country),
          };
        }
        return {
          label: localName,
          details: addr.state ? `${addr.state}, ${addr.country || "India"}` : addr.country,
        };
      }
    }
  } catch {}

  return { label: fallbackLabel, details: fallbackDetails };
}

export async function searchLocations(query: string): Promise<LocationOption[]> {
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR_LOCATIONS.slice(0, 12);

  // 1. Instant match in curated list
  const localMatches = POPULAR_LOCATIONS.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.state.toLowerCase().includes(q),
  );

  if (localMatches.length >= 4) return localMatches;

  // 2. Open-Meteo geocoding search for any location in India & worldwide
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`,
    );
    if (!res.ok) return localMatches;
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return localMatches;

    const remoteMatches: LocationOption[] = data.results.map((r: any) => {
      const lat = Number(r.latitude.toFixed(2));
      const lon = Number(r.longitude.toFixed(2));
      const nearest = findNearestKnownLocation(lat, lon, r.name);
      let nearbyInfo: string | undefined = undefined;
      if (nearest && nearest.distanceKm < 30) {
        nearbyInfo = `Near ${nearest.location.name} (~${Math.round(nearest.distanceKm)} km)`;
      }

      return {
        name: r.name,
        state: r.admin1 ? `${r.admin1}, ${r.country || ""}`.trim() : r.country || "",
        lat,
        lon,
        nearbyHub: nearbyInfo,
      };
    });

    const seen = new Set(localMatches.map((m) => `${m.lat},${m.lon}`));
    const combined = [...localMatches];
    for (const rm of remoteMatches) {
      const key = `${rm.lat},${rm.lon}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(rm);
      }
    }
    return combined.slice(0, 10);
  } catch {
    return localMatches;
  }
}
