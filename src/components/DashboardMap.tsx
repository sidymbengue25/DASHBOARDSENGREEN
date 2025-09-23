import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { parsePosition } from '../lib/geo'
import { useEffect, useState } from 'react'
import { formatDate } from '../lib/date'

type Props = {
  collectes: any[]
  depots: any[]
}

// Interface pour les zones de densité
interface DensityZone {
  center: [number, number]
  radius: number
  collectes: any[]
  depots: any[]
  totalItems: number
  color: string
  opacity: number
}

// Composant pour ajuster la vue aux données ou centrer sur le Sénégal
function FitToMarkersOrSenegal({ coords, senegalCenter }: { coords: [number, number][], senegalCenter: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length > 0) {
      // S'il y a des données, centrer sur elles
      const bounds = L.latLngBounds(coords.map(([lat, lng]) => L.latLng(lat, lng)))
      map.fitBounds(bounds, { 
        padding: [20, 20],
        maxZoom: 15 
      })
    } else {
      // Sinon, centrer sur le Sénégal
      map.setView(senegalCenter, 7)
    }
  }, [coords, senegalCenter, map])
  return null
}

export function DashboardMap({ collectes, depots }: Props) {
  const senegalCenter: [number, number] = [14.4974, -14.4524] // Centre géographique du Sénégal
  const [densityZones, setDensityZones] = useState<DensityZone[]>([])
  
  // Statistiques pour l'affichage
  const stats = {
    collectesTotal: collectes.length,
    depotsTotal: depots.length,
    collectesTerminees: collectes.filter(c => c.termine).length,
    depotsRamasses: depots.filter(d => d.ramasse).length,
    zonesTotal: densityZones.length
  }

  // Calculer les zones de densité
  useEffect(() => {
    const zones: DensityZone[] = []
    const gridSize = 0.01 // Taille de grille en degrés (environ 1km)
    const zoneMap = new Map<string, { collectes: any[], depots: any[], coords: [number, number][] }>()

    // Regrouper les points par zone géographique
    const allItems = [...collectes, ...depots]
    allItems.forEach(item => {
      const pos = parsePosition(item.position || item.location)
      if (!pos) return

      const gridX = Math.floor(pos[0] / gridSize)
      const gridY = Math.floor(pos[1] / gridSize)
      const key = `${gridX}-${gridY}`

      if (!zoneMap.has(key)) {
        zoneMap.set(key, { collectes: [], depots: [], coords: [] })
      }

      const zone = zoneMap.get(key)!
      zone.coords.push(pos)
      
      if (item.organisateur || item.dateCollecte) {
        zone.collectes.push(item)
      } else {
        zone.depots.push(item)
      }
    })

    // Créer les zones de densité
    zoneMap.forEach(({ collectes: zoneCollectes, depots: zoneDepots, coords }) => {
      if (coords.length === 0) return

      // Centre de la zone
      const centerLat = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length
      const centerLng = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length

      const totalItems = zoneCollectes.length + zoneDepots.length
      
      // Couleur et taille selon la densité
      let color = '#10B981' // Vert par défaut
      let opacity = 0.3
      let radius = Math.max(100, totalItems * 50)

      if (totalItems > 5) {
        color = '#F59E0B' // Orange pour densité moyenne
        opacity = 0.5
      }
      if (totalItems > 10) {
        color = '#EF4444' // Rouge pour haute densité
        opacity = 0.7
      }

      zones.push({
        center: [centerLat, centerLng],
        radius,
        collectes: zoneCollectes,
        depots: zoneDepots,
        totalItems,
        color,
        opacity
      })
    })

    setDensityZones(zones)
  }, [collectes, depots])

  return (
    <section className="eco-card rounded-xl p-6">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🗺️</span>
            <h3 className="font-semibold text-lg text-green-700">Vue géographique</h3>
          </div>
          <div className="text-sm text-gray-500">
            {stats.zonesTotal} zones de densité
          </div>
        </div>
        
        {/* Légende des densités */}
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-50" title="Faible densité"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-70" title="Densité moyenne"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full opacity-90" title="Haute densité"></div>
            </div>
            <span className="text-sm text-gray-600">
              Zones de densité (1-5, 6-10, 11+)
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Total: <span className="text-blue-600 font-medium">{stats.collectesTotal}</span> collectes, 
              <span className="text-red-600 font-medium ml-1">{stats.depotsTotal}</span> dépôts
            </span>
          </div>
        </div>
      </div>
      
      <div className="h-[500px] rounded-lg overflow-hidden border border-green-100">
        <MapContainer 
          center={senegalCenter} 
          zoom={7} 
          className="h-full w-full"
          doubleClickZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToMarkersOrSenegal 
            coords={densityZones.map(zone => zone.center)} 
            senegalCenter={senegalCenter} 
          />
          
          {/* Zones de densité */}
          {densityZones.map((zone, idx) => (
            <Circle
              key={idx}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: zone.opacity,
                weight: 2,
                opacity: 0.8
              }}
            >
              <Popup>
                <div className="text-sm space-y-3 min-w-56">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <span className="text-lg mr-2">📍</span>
                      Zone de densité
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {zone.totalItems} élément{zone.totalItems > 1 ? 's' : ''} dans cette zone
                    </p>
                  </div>

                  {/* Statistiques de la zone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{zone.collectes.length}</div>
                      <div className="text-xs text-gray-600">Collectes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{zone.depots.length}</div>
                      <div className="text-xs text-gray-600">Dépôts</div>
                    </div>
                  </div>

                  {/* Détails des collectes */}
                  {zone.collectes.length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-700 text-xs mb-1">🗂️ Collectes :</h5>
                      <div className="space-y-1">
                        {zone.collectes.slice(0, 3).map((c, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-medium">{c.organisateur}</span>
                            <span className={`ml-2 px-1 rounded text-xs ${
                              c.termine ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {c.termine ? 'Terminée' : 'En cours'}
                            </span>
                          </div>
                        ))}
                        {zone.collectes.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{zone.collectes.length - 3} autre{zone.collectes.length - 3 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Détails des dépôts */}
                  {zone.depots.length > 0 && (
                    <div>
                      <h5 className="font-medium text-red-700 text-xs mb-1">🗑️ Dépôts :</h5>
                      <div className="space-y-1">
                        {zone.depots.slice(0, 3).map((d, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-medium">{d.type_depot || 'Type non spécifié'}</span>
                            <span className={`ml-2 px-1 rounded text-xs ${
                              d.ramasse ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {d.ramasse ? 'Ramassé' : 'En attente'}
                            </span>
                          </div>
                        ))}
                        {zone.depots.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{zone.depots.length - 3} autre{zone.depots.length - 3 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </section>
  )
}