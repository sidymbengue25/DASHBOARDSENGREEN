import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { parsePosition } from '../lib/geo'
import { formatDate } from '../lib/date'

// Base icon assets
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
const blueIconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const blueIconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const redIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
const redIconRetinaUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'

const blueIcon = L.icon({
  iconUrl: blueIconUrl,
  iconRetinaUrl: blueIconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const redIcon = L.icon({
  iconUrl: redIconUrl,
  iconRetinaUrl: redIconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type Props = {
  collectes: any[]
  depots: any[]
}

export function DashboardMap({ collectes, depots }: Props) {
  const defaultCenter: [number, number] = [5.348, -4.027] // Abidjan (approx)
  const collecteCoords = collectes.map((c) => parsePosition(c.position || c.location))
  const depotCoords = depots.map((d) => parsePosition(d.position || d.location))
  // Debug minimal to help when data does not show
  // eslint-disable-next-line no-console
  console.log('Map data:', {
    collectesCount: collectes.length,
    collectesWithCoords: collecteCoords.filter(Boolean).length,
    depotsCount: depots.length,
    depotsWithCoords: depotCoords.filter(Boolean).length,
  })
  const allCoords = [
    ...(collecteCoords.filter(Boolean) as [number, number][]),
    ...(depotCoords.filter(Boolean) as [number, number][]),
  ]

  function FitToMarkers({ coords }: { coords: [number, number][] }) {
    const map = useMap()
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(([lat, lng]) => L.latLng(lat, lng)))
      // Add small padding to ensure markers are fully visible
      map.fitBounds(bounds, { padding: [24, 24] })
    } else {
      map.setView(defaultCenter, 12)
    }
    return null
  }

  return (
    <section className="eco-card rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🗺️</span>
        <h3 className="font-semibold text-lg text-green-700">Carte des collectes et dépôts</h3>
      </div>
      <div className="h-[420px] rounded-lg overflow-hidden border border-green-100">
        <MapContainer center={defaultCenter} zoom={12} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToMarkers coords={allCoords} />
          {collectes.map((c, idx) => {
            const parsed = parsePosition(c.position || c.location)
            if (!parsed) return null
            return (
              <Marker key={`c-${idx}`} position={parsed} icon={blueIcon} zIndexOffset={1000}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">Collecte</div>
                    <div>Organisateur: {c.organisateur || 'N/A'}</div>
                    <div>Date: {String(c.dateCollecte?.toDate?.() ?? c.dateCollecte ?? 'N/A')}</div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
          {depots.map((d, idx) => {
            const parsed = parsePosition(d.position || d.location)
            if (!parsed) return null
            return (
              <Marker key={`d-${idx}`} position={parsed} icon={redIcon} zIndexOffset={0}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">Dépôt</div>
                    <div>Type: {d.type_depot || d.etat || 'N/A'}</div>
                    <div>Ramassé: {d.ramasse === true ? 'Oui' : d.ramasse === false ? 'Non' : 'N/A'}</div>
                    <div>Date/Heure: {formatDate(d.date || d.heure || d.createdAt)}</div>
                    {d.commentaire && <div>Commentaire: {d.commentaire}</div>}
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </section>
  )
}


