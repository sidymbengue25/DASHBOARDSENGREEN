import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { parsePosition } from '../lib/geo'

interface DensityPoint {
  lat: number
  lng: number
  intensity: number
  wasteType: string
  count: number
  radius: number
}

interface DensityMapProps {
  collectes: any[]
  depots: any[]
}

// Composant pour créer la grille de densité
function DensityGrid({ points, cellSize }: { points: DensityPoint[], cellSize: number }) {
  const map = useMap()
  
  useEffect(() => {
    // Nettoyer les anciennes couches
    map.eachLayer((layer) => {
      if (layer instanceof L.Rectangle || layer instanceof L.Circle) {
        map.removeLayer(layer)
      }
    })
    
    // Créer une grille de densité
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    
    const latStep = (ne.lat - sw.lat) / cellSize
    const lngStep = (ne.lng - sw.lng) / cellSize
    
    for (let i = 0; i < cellSize; i++) {
      for (let j = 0; j < cellSize; j++) {
        const lat1 = sw.lat + i * latStep
        const lat2 = sw.lat + (i + 1) * latStep
        const lng1 = sw.lng + j * lngStep
        const lng2 = sw.lng + (j + 1) * lngStep
        
        // Compter les points dans cette cellule
        const pointsInCell = points.filter(p => 
          p.lat >= lat1 && p.lat < lat2 && p.lng >= lng1 && p.lng < lng2
        )
        
        if (pointsInCell.length > 0) {
          const intensity = pointsInCell.reduce((sum, p) => sum + p.intensity, 0) / pointsInCell.length
          const opacity = Math.min(intensity / 100, 0.8)
          
          const color = intensity > 70 ? '#EF4444' : 
                       intensity > 40 ? '#F59E0B' : '#10B981'
          
          L.rectangle([[lat1, lng1], [lat2, lng2]], {
            color: color,
            weight: 1,
            fillColor: color,
            fillOpacity: opacity * 0.5,
            opacity: opacity
          }).addTo(map)
        }
      }
    }
  }, [map, points, cellSize])
  
  return null
}

// Composant pour les isochrones
function IsochroneLayer({ center, intervals }: { center: [number, number], intervals: number[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (!center) return
    
    intervals.forEach((interval, index) => {
      const color = index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#EF4444'
      
      L.circle(center, {
        radius: interval * 1000, // Convertir en mètres
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.1,
        opacity: 0.6
      }).addTo(map)
    })
    
    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle) {
          map.removeLayer(layer)
        }
      })
    }
  }, [map, center, intervals])
  
  return null
}

export const DensityMap: React.FC<DensityMapProps> = ({ collectes, depots }) => {
  const [densityPoints, setDensityPoints] = useState<DensityPoint[]>([])
  const [selectedVisualization, setSelectedVisualization] = useState<string>('heatmap')
  const [gridSize, setGridSize] = useState<number>(20)
  const [radiusMultiplier, setRadiusMultiplier] = useState<number>(1)
  const [showIsochrones, setShowIsochrones] = useState(false)
  const [isochroneCenter, setIsochroneCenter] = useState<[number, number]>([14.4974, -14.4524])
  const [selectedWasteType, setSelectedWasteType] = useState<string>('all')
  
  // Centre du Sénégal par défaut
  const senegalCenter: [number, number] = [14.4974, -14.4524] // Centre géographique du Sénégal
  
  // Générer les points de densité
  useEffect(() => {
    const generateDensityPoints = () => {
      const points: DensityPoint[] = []
      const wasteTypes = ['autre', 'plastique', 'papier', 'verre', 'alimentaire', 'electronique', 'divers']
      
      // Traiter les collectes (pas de type de déchet spécifique)
      collectes.forEach((collecte, index) => {
        const position = parsePosition(collecte.position || collecte.location)
        if (position) {
          // Les collectes n'ont pas de type de déchet dans vos données
          const wasteType = 'divers' // Type générique pour les collectes
          const intensity = Math.random() * 100
          
          points.push({
            lat: position[0],
            lng: position[1],
            intensity: intensity,
            wasteType: wasteType,
            count: Math.floor(Math.random() * 20) + 1,
            radius: (intensity / 100) * 500 * radiusMultiplier
          })
        }
      })
      
      // Traiter les dépôts (utiliser type_depot)
      depots.forEach((depot, index) => {
        const position = parsePosition(depot.position || depot.location)
        if (position) {
          // Mapper les types de vos données aux types de l'interface
          const realType = depot.type_depot?.toLowerCase()
          let wasteType = 'autre' // défaut
          
          // Mapping des types réels
          if (realType === 'plastique') wasteType = 'plastique'
          else if (realType === 'papier') wasteType = 'papier'
          else if (realType === 'verre') wasteType = 'verre'
          else if (realType === 'alimentaire') wasteType = 'alimentaire'
          else if (realType === 'electronique') wasteType = 'electronique'
          else if (realType === 'divers') wasteType = 'divers'
          
          const intensity = Math.random() * 100
          
          points.push({
            lat: position[0],
            lng: position[1],
            intensity: intensity,
            wasteType: wasteType,
            count: Math.floor(Math.random() * 15) + 1,
            radius: (intensity / 100) * 300 * radiusMultiplier
          })
        }
      })
      
      setDensityPoints(points)
    }
    
    generateDensityPoints()
  }, [collectes, depots, radiusMultiplier])
  
  const filteredPoints = densityPoints.filter(point => 
    selectedWasteType === 'all' || point.wasteType === selectedWasteType
  )
  
  const getIntensityColor = (intensity: number) => {
    if (intensity > 80) return '#DC2626' // Rouge foncé
    if (intensity > 60) return '#EF4444' // Rouge
    if (intensity > 40) return '#F59E0B' // Orange
    if (intensity > 20) return '#FCD34D' // Jaune
    return '#10B981' // Vert
  }
  
  const wasteTypeIcons = {
    'autre': '📦',
    'plastique': '🔄',
    'papier': '📄',
    'verre': '🍷',
    'alimentaire': '🍎',
    'electronique': '📱',
    'divers': '📋'
  }
  
  return (
    <div className="space-y-6">
      <div className="eco-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Carte de densité avancée</h2>
            <p className="text-gray-600">Analyse spatiale de la distribution des déchets avec visualisations multiples</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedVisualization}
              onChange={(e) => setSelectedVisualization(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="heatmap">Carte de chaleur</option>
              <option value="grid">Grille de densité</option>
              <option value="circles">Cercles proportionnels</option>
              <option value="contours">Courbes de niveau</option>
            </select>
            
            <select
              value={selectedWasteType}
              onChange={(e) => setSelectedWasteType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les types</option>
              <option value="autre">Autre</option>
              <option value="plastique">Plastique</option>
              <option value="papier">Papier</option>
              <option value="verre">Verre</option>
              <option value="alimentaire">Alimentaire</option>
              <option value="electronique">Électronique</option>
              <option value="divers">Divers</option>
            </select>
          </div>
        </div>
        
        {/* Contrôles avancés */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Taille de grille:</label>
            <input
              type="range"
              min="10"
              max="50"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{gridSize}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Rayon:</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={radiusMultiplier}
              onChange={(e) => setRadiusMultiplier(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{radiusMultiplier}x</span>
          </div>
          
          <button
            onClick={() => setShowIsochrones(!showIsochrones)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showIsochrones ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>📍</span>
            <span>Isochrones</span>
          </button>
        </div>
        
        {/* Carte de densité */}
        <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200 mb-6">
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
            
            {selectedVisualization === 'grid' && (
              <DensityGrid points={filteredPoints} cellSize={gridSize} />
            )}
            
            {selectedVisualization === 'circles' && filteredPoints.map((point, index) => (
              <Circle
                key={index}
                center={[point.lat, point.lng]}
                radius={point.radius}
                pathOptions={{
                  color: getIntensityColor(point.intensity),
                  fillColor: getIntensityColor(point.intensity),
                  fillOpacity: Math.min(point.intensity / 100, 0.6),
                  weight: 2,
                  opacity: 0.8
                }}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{wasteTypeIcons[point.wasteType as keyof typeof wasteTypeIcons]}</span>
                      <span className="font-medium capitalize">{point.wasteType}</span>
                    </div>
                    <div><strong>Intensité:</strong> {Math.round(point.intensity)}%</div>
                    <div><strong>Nombre d'éléments:</strong> {point.count}</div>
                    <div><strong>Position:</strong> {point.lat.toFixed(4)}, {point.lng.toFixed(4)}</div>
                  </div>
                </Popup>
              </Circle>
            ))}
            
            {selectedVisualization === 'heatmap' && filteredPoints.map((point, index) => (
              <Circle
                key={index}
                center={[point.lat, point.lng]}
                radius={point.radius / 2}
                pathOptions={{
                  color: 'transparent',
                  fillColor: getIntensityColor(point.intensity),
                  fillOpacity: point.intensity / 200,
                  weight: 0
                }}
              />
            ))}
            
            {showIsochrones && (
              <IsochroneLayer 
                center={isochroneCenter} 
                intervals={[1, 2, 5]} // km
              />
            )}
          </MapContainer>
        </div>
        
        {/* Statistiques de densité */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Points analysés</h4>
            <p className="text-2xl font-bold text-blue-600">{filteredPoints.length}</p>
            <p className="text-sm text-gray-500">Total visible</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Densité moyenne</h4>
            <p className="text-2xl font-bold text-green-600">
              {filteredPoints.length > 0 ? 
                Math.round(filteredPoints.reduce((sum, p) => sum + p.intensity, 0) / filteredPoints.length) : 0}%
            </p>
            <p className="text-sm text-gray-500">Intensité</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Zones critiques</h4>
            <p className="text-2xl font-bold text-red-600">
              {filteredPoints.filter(p => p.intensity > 70).length}
            </p>
            <p className="text-sm text-gray-500">Intensité &#x3C; 70%</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Couverture</h4>
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(filteredPoints.length > 0 ? 
                filteredPoints.reduce((sum, p) => sum + p.radius, 0) / 1000 : 0)}
            </p>
            <p className="text-sm text-gray-500">km² estimés</p>
          </div>
        </div>
        
        {/* Légende de densité */}
        <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Échelle d'intensité</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Faible (0-20%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm">Modérée (20-40%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Élevée (40-60%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Haute (60-80%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-700 rounded"></div>
              <span className="text-sm">Critique (80-100%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
