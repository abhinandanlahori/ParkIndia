export type GeoPoint = { latitude: number; longitude: number };

const DELHI_NCR_CENTER: GeoPoint = { latitude: 28.6139, longitude: 77.209 };

export async function geocodeIndianAddress(
  address: string,
): Promise<GeoPoint | null> {
  const query = encodeURIComponent(`${address.trim()}, India`);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "User-Agent": "ParkIndia/1.0 (beta parking app)" } },
    );

    if (!response.ok) return null;

    const results = (await response.json()) as Array<{
      lat: string;
      lon: string;
    }>;

    if (!results.length) return null;

    return {
      latitude: Number(results[0].lat),
      longitude: Number(results[0].lon),
    };
  } catch {
    return null;
  }
}

export function getDefaultMapCenter(): GeoPoint {
  return DELHI_NCR_CENTER;
}
