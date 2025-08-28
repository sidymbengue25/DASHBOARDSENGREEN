export type LatLng = [number, number]

export function parsePosition(raw: unknown): LatLng | null {
  // Already an array [lat, lng]
  if (Array.isArray(raw) && raw.length === 2 &&
      typeof raw[0] === 'number' && typeof raw[1] === 'number') {
    return [raw[0], raw[1]]
  }

  // Firestore GeoPoint
  if (raw && typeof raw === 'object') {
    const r: any = raw
    if (typeof r.latitude === 'number' && typeof r.longitude === 'number') {
      return [r.latitude, r.longitude]
    }
  }

  // String format like: "[14.753314999968476° N, 17.46982343494892° W]"
  if (typeof raw === 'string') {
    const s = raw.trim()
    // Extract two components between brackets or otherwise
    const match = s.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([NSEW])?[^-\d]*(-?\d+(?:\.\d+)?)\s*°?\s*([NSEW])?/i)
    if (match) {
      let lat = parseFloat(match[1])
      let latH = (match[2] || '').toUpperCase()
      let lng = parseFloat(match[3])
      let lngH = (match[4] || '').toUpperCase()
      if (latH === 'S') lat = -lat
      if (lngH === 'W') lng = -lng
      return [lat, lng]
    }
    // Alternative: comma-separated numbers "14.1, -16.09"
    const parts = s.replace(/[\[\]]/g, '').split(',').map(p => p.trim())
    if (parts.length === 2) {
      const lat = Number(parts[0])
      const lng = Number(parts[1])
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return [lat, lng]
      }
    }
  }

  return null
}


