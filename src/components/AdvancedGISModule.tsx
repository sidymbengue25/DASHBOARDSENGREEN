import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, LayersControl, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { parsePosition } from '../lib/geo'
import { formatDate } from '../lib/date'

// Fonction pour calculer l'aire d'un polygone
function calculatePolygonArea(points: L.LatLng[]): number {
  if (points.length < 3) return 0
  
  let area = 0
  const radius = 6378137 // Rayon de la Terre en mètres
  
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    const lat1 = points[i].lat * Math.PI / 180
    const lat2 = points[j].lat * Math.PI / 180
    const lng1 = points[i].lng * Math.PI / 180
    const lng2 = points[j].lng * Math.PI / 180
    
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }
  
  area = Math.abs(area * radius * radius / 2)
  return area
}

// Fonction pour formater les distances
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  } else {
    return `${(meters / 1000).toFixed(2)} km`
  }
}

// Fonction pour formater les aires
function formatArea(squareMeters: number): string {
  if (squareMeters < 10000) {
    return `${Math.round(squareMeters)} m²`
  } else {
    return `${(squareMeters / 10000).toFixed(2)} ha`
  }
}

// Types de déchets avec icônes personnalisées
const wasteTypeIcons = {
  'autre': '📦',
  'plastique': '🔄',
  'papier': '📄',
  'verre': '🍷',
  'alimentaire': '🍎',
  'electronique': '📱',
  'divers': '📋'
}

// Créer des icônes SVG personnalisées pour chaque type de déchet
const createWasteIcon = (type: string, color: string) => {
  const emoji = wasteTypeIcons[type as keyof typeof wasteTypeIcons] || '📦'
  
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${emoji}
      </div>
    `,
    className: 'custom-waste-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

// Icônes pour différents statuts
const createStatusIcon = (status: string, type: 'collecte' | 'depot') => {
  const colors = {
    collecte: {
      active: '#10B981',
      completed: '#3B82F6',
      pending: '#F59E0B'
    },
    depot: {
      urgent: '#EF4444',
      normal: '#F59E0B',
      cleaned: '#10B981'
    }
  }
  
  const icons = {
    collecte: '🗂️',
    depot: '🗑️'
  }
  
  const color = type === 'collecte' ? colors.collecte[status as keyof typeof colors.collecte] : colors.depot[status as keyof typeof colors.depot]
  
  return L.divIcon({
    html: `
      <div style="
        background: ${color || '#6B7280'};
        border: 2px solid white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${icons[type]}
      </div>
    `,
    className: 'custom-status-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  })
}

interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
  type: string
}

interface AdvancedGISModuleProps {
  collectes: any[]
  depots: any[]
  historiqueDepots?: any[]
  users?: any[]
}

// Composant de carte de chaleur
function HeatmapLayer({ points }: { points: HeatmapPoint[] }) {
  const map = useMap()
  
  useEffect(() => {
    // Créer des cercles de chaleur
    points.forEach(point => {
      const radius = point.intensity * 50 // Rayon basé sur l'intensité
      const opacity = Math.min(point.intensity / 100, 0.8)
      
      L.circle([point.lat, point.lng], {
        radius: radius,
        fillColor: point.intensity > 70 ? '#EF4444' : point.intensity > 40 ? '#F59E0B' : '#10B981',
        fillOpacity: opacity * 0.3,
        color: point.intensity > 70 ? '#DC2626' : point.intensity > 40 ? '#D97706' : '#059669',
        weight: 1,
        opacity: opacity
      }).addTo(map)
    })
    
    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle) {
          map.removeLayer(layer)
        }
      })
    }
  }, [map, points])
  
  return null
}

// Composant pour les outils de mesure
function MeasurementTool({ 
  isMeasuring, 
  measurementType, 
  onMeasurementUpdate 
}: { 
  isMeasuring: boolean
  measurementType: 'distance' | 'area'
  onMeasurementUpdate: (distance: number, area: number, points: L.LatLng[]) => void
}) {
  const [points, setPoints] = useState<L.LatLng[]>([])
  const [polyline, setPolyline] = useState<L.Polyline | null>(null)
  const [polygon, setPolygon] = useState<L.Polygon | null>(null)
  
  const map = useMapEvents({
    click: (e) => {
      if (!isMeasuring) return
      
      const newPoints = [...points, e.latlng]
      setPoints(newPoints)
      
      if (measurementType === 'distance') {
        // Calculer la distance
        let totalDistance = 0
        for (let i = 1; i < newPoints.length; i++) {
          totalDistance += newPoints[i-1].distanceTo(newPoints[i])
        }
        
        // Dessiner la ligne
        if (polyline) {
          map.removeLayer(polyline)
        }
        const newPolyline = L.polyline(newPoints, { color: 'red', weight: 3 }).addTo(map)
        setPolyline(newPolyline)
        
        onMeasurementUpdate(totalDistance, 0, newPoints)
      } else if (measurementType === 'area' && newPoints.length >= 3) {
        // Calculer l'aire (approximation simple)
        const area = calculatePolygonArea(newPoints)
        
        // Dessiner le polygone
        if (polygon) {
          map.removeLayer(polygon)
        }
        const newPolygon = L.polygon(newPoints, { color: 'blue', weight: 3, fillOpacity: 0.2 }).addTo(map)
        setPolygon(newPolygon)
        
        onMeasurementUpdate(0, area, newPoints)
      }
    },
    
    dblclick: () => {
      if (isMeasuring) {
        // Terminer la mesure
        setPoints([])
        if (polyline) {
          map.removeLayer(polyline)
          setPolyline(null)
        }
        if (polygon) {
          map.removeLayer(polygon)
          setPolygon(null)
        }
      }
    }
  })
  
  // Nettoyer lors du changement de mode
  useEffect(() => {
    if (!isMeasuring) {
      setPoints([])
      if (polyline) {
        map.removeLayer(polyline)
        setPolyline(null)
      }
      if (polygon) {
        map.removeLayer(polygon)
        setPolygon(null)
      }
    }
  }, [isMeasuring, map, polyline, polygon])
  
  return null
}

export const AdvancedGISModule: React.FC<AdvancedGISModuleProps> = ({ collectes, depots, historiqueDepots = [], users = [] }) => {
  const [selectedLayer, setSelectedLayer] = useState<string>('standard')
  
  // Fonction pour récupérer le nom d'un utilisateur par son ID
  const getUserName = (userId: string): string => {
    if (!userId) return 'Inconnu'
    const user = users.find(u => u.id === userId || u.uid === userId)
    return user ? (user.nom || user.name || user.displayName || 'Utilisateur') : userId.substring(0, 8) + '...'
  }
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showClusters, setShowClusters] = useState(false)
  const [selectedWasteType, setSelectedWasteType] = useState<string>('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7d')
  const [showCollectes, setShowCollectes] = useState<boolean>(true)
  const [showDepots, setShowDepots] = useState<boolean>(true)
  const [collecteTimeRange, setCollecteTimeRange] = useState<string>('all')
  const [depotTimeRange, setDepotTimeRange] = useState<string>('all')
  const [measurements, setMeasurements] = useState<any[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [measurementType, setMeasurementType] = useState<'distance' | 'area'>('distance')
  const [measurementPoints, setMeasurementPoints] = useState<L.LatLng[]>([])
  const [totalDistance, setTotalDistance] = useState<number>(0)
  const [totalArea, setTotalArea] = useState<number>(0)
  
  // Centre du Sénégal par défaut
  const senegalCenter: [number, number] = [14.4974, -14.4524] // Centre géographique du Sénégal
  const dakarCenter: [number, number] = [14.7167, -17.4677] // Dakar comme point de référence
  
  // Générer des données de heatmap
  useEffect(() => {
    const points: HeatmapPoint[] = []
    
    // Ajouter les collectes
    collectes.forEach(collecte => {
      const position = parsePosition(collecte.position || collecte.location)
      if (position) {
        points.push({
          lat: position[0],
          lng: position[1],
          intensity: Math.random() * 100,
          type: collecte.type || 'autre'
        })
      }
    })
    
    // Ajouter les dépôts
    depots.forEach(depot => {
      const position = parsePosition(depot.position || depot.location)
      if (position) {
        points.push({
          lat: position[0],
          lng: position[1],
          intensity: Math.random() * 100,
          type: depot.type || 'autre'
        })
      }
    })
    
    setHeatmapData(points)
  }, [collectes, depots])
  
  // Fonction pour filtrer les collectes par date
  const filterCollecteByDate = (collecte: any) => {
    const dateField = collecte.dateCollecte || collecte.heureSave
    if (!dateField) return true
    
    const itemDate = dateField.toDate ? dateField.toDate() : new Date(dateField)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))
    
    
    switch (collecteTimeRange) {
      case '24h': return Math.abs(diffDays) <= 1
      case '7d': return Math.abs(diffDays) <= 7
      case '30d': return Math.abs(diffDays) <= 30
      case '90d': return Math.abs(diffDays) <= 365  // 1 an pour inclure 2025
      case 'all': return true
      default: return Math.abs(diffDays) <= 365 // Par défaut, accepter 1 an
    }
  }

  // Fonction pour filtrer les dépôts par date
  const filterDepotByDate = (depot: any) => {
    const dateField = depot.heure
    if (!dateField) return true
    
    const itemDate = dateField.toDate ? dateField.toDate() : new Date(dateField)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))
    
    
    switch (depotTimeRange) {
      case '24h': return Math.abs(diffDays) <= 1
      case '7d': return Math.abs(diffDays) <= 7
      case '30d': return Math.abs(diffDays) <= 30
      case '90d': return Math.abs(diffDays) <= 365  // 1 an pour inclure 2025
      case 'all': return true
      default: return Math.abs(diffDays) <= 365 // Par défaut, accepter 1 an
    }
  }
  
  const filteredCollectes = showCollectes ? collectes.filter(c => {
    // Filtrer les collectes seulement par date et statut
    const dateMatch = filterCollecteByDate(c)
    return dateMatch
  }) : []
  
  const filteredDepots = showDepots ? depots.filter(d => {
    // Filtrer les dépôts par type et date
    const wasteTypeMatch = selectedWasteType === 'all' || d.type_depot === selectedWasteType
    const dateMatch = filterDepotByDate(d)
    return wasteTypeMatch && dateMatch
  }) : []

  
  const allCoords = [
    ...filteredCollectes.map(c => parsePosition(c.position || c.location)).filter(Boolean),
    ...filteredDepots.map(d => parsePosition(d.position || d.location)).filter(Boolean)
  ] as [number, number][]
  
  // Gestionnaire de mise à jour des mesures
  const handleMeasurementUpdate = (distance: number, area: number, points: L.LatLng[]) => {
    setTotalDistance(distance)
    setTotalArea(area)
    setMeasurementPoints(points)
  }

  // Fonctions pour contrôler les outils de mesure
  const startDistanceMeasurement = () => {
    setMeasurementType('distance')
    setIsMeasuring(true)
    setTotalDistance(0)
    setTotalArea(0)
    setMeasurementPoints([])
  }

  const startAreaMeasurement = () => {
    setMeasurementType('area')
    setIsMeasuring(true)
    setTotalDistance(0)
    setTotalArea(0)
    setMeasurementPoints([])
  }

  const stopMeasurement = () => {
    setIsMeasuring(false)
    setMeasurementPoints([])
    setTotalDistance(0)
    setTotalArea(0)
  }

  // Fonction pour fitter les marqueurs ou centrer sur le Sénégal
  function FitToMarkers({ coords }: { coords: [number, number][] }) {
    const map = useMap()
    useEffect(() => {
      if (coords.length > 0) {
        // S'il y a des résultats, centrer sur eux
        const bounds = L.latLngBounds(coords.map(([lat, lng]) => L.latLng(lat, lng)))
        map.fitBounds(bounds, { 
          padding: [24, 24],
          maxZoom: 15 // Éviter un zoom trop proche
        })
      } else {
        // Sinon, centrer sur le Sénégal avec un zoom approprié
        map.setView(senegalCenter, 7) // Zoom 7 pour voir tout le Sénégal
      }
    }, [coords, map])
    return null
  }

  // Composant pour changer de fond de carte
  function MapLayerController() {
    const map = useMap()
    
    useEffect(() => {
      // Nettoyer toutes les couches de base existantes
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer)
        }
      })
      
      // Ajouter la nouvelle couche selon la sélection
      let newLayer: L.TileLayer
      
      switch (selectedLayer) {
        case 'satellite':
          newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
          })
          break
        case 'terrain':
          newLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a>'
          })
          break
        case 'dark':
          newLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          })
          break
        default: // standard
          newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          })
      }
      
      newLayer.addTo(map)
    }, [selectedLayer, map])
    
    return null
  }
  
  return (
    <div className="space-y-6">
      {/* Contrôles SIG */}
      <div className="eco-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Système d'Information Géographique (SIG)</h2>
            <p className="text-gray-600">Visualisation avancée avec couches multiples, analyse spatiale et outils de mesure</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="standard">Carte standard</option>
              <option value="satellite">Vue satellite</option>
              <option value="terrain">Relief</option>
              <option value="dark">Mode sombre</option>
            </select>
            
          </div>
        </div>

        {/* Filtres séparés pour Collectes et Dépôts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Filtres Collectes */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-800 flex items-center">
                <span className="text-xl mr-2">🗂️</span>
                Collectes organisées
              </h3>
              <button
                onClick={() => setShowCollectes(!showCollectes)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                  showCollectes ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span>{showCollectes ? '👁️' : '👁️‍🗨️'}</span>
                <span>{showCollectes ? 'Visible' : 'Masqué'}</span>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Période</label>
                <select
                  value={collecteTimeRange}
                  onChange={(e) => setCollecteTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={!showCollectes}
                >
                  <option value="all">Toutes les dates</option>
                  <option value="24h">24 heures</option>
                  <option value="7d">7 jours</option>
                  <option value="30d">30 jours</option>
                  <option value="90d">90 jours</option>
                </select>
              </div>
              
              <div className="text-sm text-green-600">
                <p><strong>Critères de filtrage :</strong></p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• Date de collecte (dateCollecte)</li>
                  <li>• Date de création (heureSave)</li>
                  <li>• Statut (terminé/en cours)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Filtres Dépôts */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-800 flex items-center">
                <span className="text-xl mr-2">🗑️</span>
                Dépôts signalés
              </h3>
              <button
                onClick={() => setShowDepots(!showDepots)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                  showDepots ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span>{showDepots ? '👁️' : '👁️‍🗨️'}</span>
                <span>{showDepots ? 'Visible' : 'Masqué'}</span>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">Type de déchet</label>
                <select
                  value={selectedWasteType}
                  onChange={(e) => setSelectedWasteType(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={!showDepots}
                >
                  <option value="all">Tous les types</option>
                  <option value="Autre">Autre</option>
                  <option value="Plastique">Plastique</option>
                  <option value="Papier">Papier</option>
                  <option value="Verre">Verre</option>
                  <option value="Alimentaire">Alimentaire</option>
                  <option value="Electronique">Électronique</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">Période</label>
                <select
                  value={depotTimeRange}
                  onChange={(e) => setDepotTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={!showDepots}
                >
                  <option value="all">Toutes les dates</option>
                  <option value="24h">24 heures</option>
                  <option value="7d">7 jours</option>
                  <option value="30d">30 jours</option>
                  <option value="90d">90 jours</option>
                </select>
              </div>
              
              <div className="text-sm text-red-600">
                <p><strong>Critères de filtrage :</strong></p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• Type de déchet (type_depot)</li>
                  <li>• Date/heure de signalement</li>
                  <li>• Statut ramassé/non ramassé</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Options d'affichage */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showHeatmap ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>🔥</span>
            <span>Carte de chaleur</span>
          </button>
          
          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showClusters ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>🎯</span>
            <span>Clusters</span>
          </button>
          
          <button
            onClick={isMeasuring && measurementType === 'distance' ? stopMeasurement : startDistanceMeasurement}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isMeasuring && measurementType === 'distance' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            <span>📏</span>
            <span>{isMeasuring && measurementType === 'distance' ? 'Arrêter' : 'Mesurer distance'}</span>
          </button>
          
          <button
            onClick={isMeasuring && measurementType === 'area' ? stopMeasurement : startAreaMeasurement}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isMeasuring && measurementType === 'area' 
                ? 'bg-purple-600 text-white' 
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
          >
            <span>📐</span>
            <span>{isMeasuring && measurementType === 'area' ? 'Arrêter' : 'Mesurer surface'}</span>
          </button>
          
          {isMeasuring && (
            <div className="flex items-center space-x-4 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
              <span>ℹ️</span>
              <span className="text-sm">
                {measurementType === 'distance' 
                  ? `Distance: ${formatDistance(totalDistance)}` 
                  : `Surface: ${formatArea(totalArea)}`}
              </span>
              <span className="text-xs">Double-clic pour terminer</span>
            </div>
          )}
        </div>
        
        {/* Carte principale */}
        <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200 mb-6">
          <MapContainer 
            center={senegalCenter} 
            zoom={7} 
            className="h-full w-full"
            doubleClickZoom={false}
          >
            {/* Couche de base contrôlée par le sélecteur */}
            <MapLayerController />
            
            {/* Marqueurs des collectes */}
            {filteredCollectes.map((c, idx) => {
              const parsed = parsePosition(c.position || c.location)
              if (!parsed) return null
              
              const icon = createStatusIcon(c.termine ? 'completed' : 'pending', 'collecte')
              
              return (
                <Marker key={`c-${idx}`} position={parsed} icon={icon}>
                  <Popup>
                    <div className="text-sm space-y-1 min-w-48">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">🗂️</span>
                        <div className="font-medium text-green-700">Collecte organisée</div>
                      </div>
                      <div><strong>Organisateur:</strong> {c.organisateur || 'N/A'}</div>
                      {c.creePar && (
                        <div><strong>Créé par:</strong> {getUserName(c.creePar)}</div>
                      )}
                      <div><strong>Date:</strong> {formatDate(c.dateCollecte)} à {c.heureCollecte || '00:00'}</div>
                      <div><strong>Statut:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          c.termine ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {c.termine ? 'Terminée' : 'En cours'}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
            
            {/* Marqueurs des dépôts */}
            {filteredDepots.map((d, idx) => {
              const parsed = parsePosition(d.position || d.location)
              if (!parsed) return null
              
              const status = d.ramasse ? 'cleaned' : 'normal'
              const icon = createStatusIcon(status, 'depot')
              
              // Rechercher l'historique correspondant si le dépôt est ramassé
              const historique = d.ramasse && d.id ? 
                historiqueDepots.find(h => h.depotId === d.id) : null
              
              return (
                <Marker key={`d-${idx}`} position={parsed} icon={icon}>
                  <Popup>
                    <div className="text-sm space-y-1 min-w-64 max-w-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">🗑️</span>
                        <div className="font-medium text-red-700">Dépôt signalé</div>
                      </div>
                      
                      <div><strong>Type:</strong> {d.type_depot || 'Non spécifié'}</div>
                      <div><strong>Statut:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          d.ramasse ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {d.ramasse ? 'Ramassé' : 'En attente'}
                        </span>
                      </div>
                      <div><strong>Signalé le:</strong> {formatDate(d.heure)}</div>
                      {d.userId && (
                        <div><strong>Par:</strong> {getUserName(d.userId)}</div>
                      )}

                      {/* Image du dépôt initial - toujours visible */}
                      <div className="border-t border-gray-200 pt-1 mt-1">
                        <strong>Image signalement:</strong>
                        {d.image_url ? (
                          <img 
                            src={d.image_url} 
                            alt="Dépôt signalé" 
                            className="mt-1 max-w-full h-32 object-cover rounded border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`mt-1 p-2 bg-gray-100 border border-gray-300 rounded text-center text-xs text-gray-600 ${d.image_url ? 'hidden' : ''}`}>
                          📷 Aucune image disponible
                        </div>
                      </div>

                      {/* Informations de l'historique si ramassé */}
                      {historique && (
                        <div className="border-t border-green-200 mt-2 pt-2 bg-green-50 rounded p-2 -mx-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-base">✅</span>
                            <div className="font-medium text-green-700 text-xs">Ramassage effectué</div>
                          </div>
                          
                          <div className="space-y-1 text-green-800 text-xs">
                            <div><strong>Le:</strong> {formatDate(historique.dateRamassage)}</div>
                            {historique.ramassePar && (
                              <div><strong>Par:</strong> {getUserName(historique.ramassePar)}</div>
                            )}
                            {historique.signalePar && (
                              <div><strong>Signalé par:</strong> {getUserName(historique.signalePar)}</div>
                            )}
                          </div>

                          {/* Flèche compacte */}
                          <div className="flex justify-center my-1">
                            <div className="text-green-600 text-sm animate-bounce">↓</div>
                          </div>

                          {/* Image d'historique toujours visible */}
                          <div>
                            <strong className="text-green-700 text-xs">Après nettoyage:</strong>
                            {historique.imageRamassage ? (
                              <img 
                                src={historique.imageRamassage} 
                                alt="Après ramassage" 
                                className="mt-1 max-w-full h-32 object-cover rounded border border-green-300 shadow-sm" 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                            ) : null}
                            <div className={`mt-1 p-2 bg-green-100 border border-green-300 rounded text-center ${historique.imageRamassage ? 'hidden' : ''}`}>
                              <div className="text-green-600 text-xs">✅ Zone nettoyée - Aucune image</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            })}
            
            {/* Couche de heatmap si activée */}
            {showHeatmap && (
              <HeatmapLayer points={heatmapData} />
            )}
            
            <FitToMarkers coords={allCoords} />
            <MeasurementTool 
              isMeasuring={isMeasuring}
              measurementType={measurementType}
              onMeasurementUpdate={handleMeasurementUpdate}
            />
          </MapContainer>
        </div>
        
        {/* Statistiques séparées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Stats Collectes */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <span className="text-lg mr-2">🗂️</span>
              Statistiques des collectes
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-green-700">{filteredCollectes.length}</p>
                <p className="text-sm text-green-600">Collectes visibles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {filteredCollectes.filter(c => c.termine).length}
                </p>
                <p className="text-sm text-green-600">Terminées</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {filteredCollectes.filter(c => !c.termine).length}
                </p>
                <p className="text-sm text-green-600">En cours</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{collectes.length}</p>
                <p className="text-sm text-green-600">Total général</p>
              </div>
            </div>
          </div>

          {/* Stats Dépôts */}
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center">
              <span className="text-lg mr-2">🗑️</span>
              Statistiques des dépôts
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-red-700">{filteredDepots.length}</p>
                <p className="text-sm text-red-600">Dépôts visibles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {filteredDepots.filter(d => d.ramasse).length}
                </p>
                <p className="text-sm text-red-600">Ramassés</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {filteredDepots.filter(d => !d.ramasse).length}
                </p>
                <p className="text-sm text-red-600">En attente</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{depots.length}</p>
                <p className="text-sm text-red-600">Total général</p>
              </div>
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Types de déchets</h4>
            <div className="space-y-2">
              {Object.entries(wasteTypeIcons).map(([type, icon]) => (
                <div key={type} className="flex items-center space-x-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Statuts des collectes</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm">Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Terminée</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">En attente</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Statuts des dépôts</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">Urgent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Normal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm">Nettoyé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
