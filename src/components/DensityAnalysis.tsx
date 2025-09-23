import React, { useState, useEffect } from 'react'

interface DensityPoint {
  id: string
  lat: number
  lng: number
  intensity: number
  type: 'residential' | 'industrial' | 'commercial' | 'public'
  wasteType: string
  timestamp: string
}

interface DensityAnalysisProps {
  collectes: any[]
  depots: any[]
}

export const DensityAnalysis: React.FC<DensityAnalysisProps> = ({ collectes, depots }) => {
  const [densityData, setDensityData] = useState<DensityPoint[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedWasteType, setSelectedWasteType] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('7d')
  const [loading, setLoading] = useState(true)

  // Simuler la génération de données de densité
  useEffect(() => {
    const generateDensityData = () => {
      const points: DensityPoint[] = []
      
      // Types de déchets disponibles
      const wasteTypes = ['autre', 'plastique', 'papier', 'verre', 'alimentaire', 'electronique', 'divers']
      
      // Générer des points basés sur les collectes et dépôts
      collectes.forEach((collecte, index) => {
        if (collecte.latitude && collecte.longitude) {
          points.push({
            id: `collecte-${index}`,
            lat: collecte.latitude,
            lng: collecte.longitude,
            intensity: Math.random() * 100,
            type: ['residential', 'industrial', 'commercial', 'public'][Math.floor(Math.random() * 4)] as any,
            wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
            timestamp: collecte.date || new Date().toISOString()
          })
        }
      })

      depots.forEach((depot, index) => {
        if (depot.latitude && depot.longitude) {
          points.push({
            id: `depot-${index}`,
            lat: depot.latitude,
            lng: depot.longitude,
            intensity: Math.random() * 100,
            type: ['residential', 'industrial', 'commercial', 'public'][Math.floor(Math.random() * 4)] as any,
            wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
            timestamp: depot.date || new Date().toISOString()
          })
        }
      })

      setDensityData(points)
      setLoading(false)
    }

    generateDensityData()
  }, [collectes, depots])

  const filteredData = densityData.filter(point => {
    const typeMatch = selectedType === 'all' || point.type === selectedType
    const wasteMatch = selectedWasteType === 'all' || point.wasteType === selectedWasteType
    return typeMatch && wasteMatch
  })

  const getIntensityColor = (intensity: number) => {
    if (intensity < 20) return 'bg-green-100 text-green-800'
    if (intensity < 40) return 'bg-yellow-100 text-yellow-800'
    if (intensity < 60) return 'bg-orange-100 text-orange-800'
    if (intensity < 80) return 'bg-red-100 text-red-800'
    return 'bg-red-200 text-red-900'
  }

  const getWasteTypeIcon = (wasteType: string) => {
    const icons: Record<string, string> = {
      'autre': '📦',
      'plastique': '🔄',
      'papier': '📄',
      'verre': '🍷',
      'alimentaire': '🍎',
      'electronique': '📱',
      'divers': '📋'
    }
    return icons[wasteType] || '📦'
  }

  const getWasteTypeColor = (wasteType: string) => {
    const colors: Record<string, string> = {
      'autre': 'gray',
      'plastique': 'blue',
      'papier': 'yellow',
      'verre': 'cyan',
      'alimentaire': 'green',
      'electronique': 'purple',
      'divers': 'pink'
    }
    return colors[wasteType] || 'gray'
  }

  const getTypeStats = () => {
    const stats = {
      residential: 0,
      industrial: 0,
      commercial: 0,
      public: 0
    }
    
    filteredData.forEach(point => {
      stats[point.type]++
    })
    
    return stats
  }

  const typeStats = getTypeStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="eco-card rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="eco-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyse de densité des déchets</h2>
            <p className="text-gray-600">Heatmap des concentrations de déchets par zone géographique avec corrélations environnementales</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les types</option>
              <option value="residential">Résidentiel</option>
              <option value="industrial">Industriel</option>
              <option value="commercial">Commercial</option>
              <option value="public">Public</option>
            </select>
            
            <select
              value={selectedWasteType}
              onChange={(e) => setSelectedWasteType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les déchets</option>
              <option value="autre">Autre</option>
              <option value="plastique">Plastique</option>
              <option value="papier">Papier</option>
              <option value="verre">Verre</option>
              <option value="alimentaire">Alimentaire</option>
              <option value="electronique">Électronique</option>
              <option value="divers">Divers</option>
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="24h">24h</option>
              <option value="7d">7 jours</option>
              <option value="30d">30 jours</option>
              <option value="90d">90 jours</option>
            </select>
          </div>
        </div>

        {/* Statistiques par type */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Résidentiel</p>
                <p className="text-2xl font-bold text-blue-900">{typeStats.residential}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Industriel</p>
                <p className="text-2xl font-bold text-orange-900">{typeStats.industrial}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Commercial</p>
                <p className="text-2xl font-bold text-green-900">{typeStats.commercial}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Public</p>
                <p className="text-2xl font-bold text-purple-900">{typeStats.public}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Simulation */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Heatmap de densité</h3>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 64 }, (_, i) => {
              const intensity = Math.random() * 100
              return (
                <div
                  key={i}
                  className={`h-8 rounded ${getIntensityColor(intensity)} flex items-center justify-center text-xs font-medium`}
                  style={{ opacity: intensity / 100 }}
                >
                  {Math.round(intensity)}
                </div>
              )
            })}
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Faible densité</span>
            <div className="flex space-x-1">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <div className="w-4 h-4 bg-yellow-200 rounded"></div>
              <div className="w-4 h-4 bg-orange-200 rounded"></div>
              <div className="w-4 h-4 bg-red-200 rounded"></div>
            </div>
            <span>Forte densité</span>
          </div>
        </div>

        {/* Liste des points de haute densité */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Points de haute densité</h3>
          <div className="space-y-3">
            {filteredData
              .filter(point => point.intensity > 70)
              .sort((a, b) => b.intensity - a.intensity)
              .slice(0, 10)
              .map((point) => (
                <div key={point.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getIntensityColor(point.intensity).replace('bg-', 'bg-').replace('text-', 'text-')}`}></div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getWasteTypeIcon(point.wasteType)}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {point.type === 'residential' ? 'Résidentiel' :
                           point.type === 'industrial' ? 'Industriel' :
                           point.type === 'commercial' ? 'Commercial' : 'Public'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)} • {point.wasteType.charAt(0).toUpperCase() + point.wasteType.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{Math.round(point.intensity)}%</p>
                    <p className="text-xs text-gray-500">Intensité</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
