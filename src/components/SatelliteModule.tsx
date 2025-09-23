import React, { useState, useEffect } from 'react'
import { formatDate } from '../lib/date'

interface SatelliteModuleProps {
  collectes: any[]
  depots: any[]
}

export const SatelliteModule: React.FC<SatelliteModuleProps> = ({ collectes, depots }) => {
  const [selectedSatellite, setSelectedSatellite] = useState('sentinel-2')
  const [selectedDate, setSelectedDate] = useState('2024-01-01')
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Types de satellites disponibles
  const satellites = [
    { 
      id: 'sentinel-2', 
      name: 'Sentinel-2', 
      provider: 'ESA',
      resolution: '10m',
      revisit: '5 jours',
      bands: ['RGB', 'NIR', 'SWIR'],
      color: 'blue'
    },
    { 
      id: 'landsat-8', 
      name: 'Landsat-8', 
      provider: 'NASA',
      resolution: '30m',
      revisit: '16 jours',
      bands: ['RGB', 'NIR', 'SWIR', 'TIR'],
      color: 'green'
    },
    { 
      id: 'landsat-9', 
      name: 'Landsat-9', 
      provider: 'NASA',
      resolution: '30m',
      revisit: '16 jours',
      bands: ['RGB', 'NIR', 'SWIR', 'TIR'],
      color: 'purple'
    },
    { 
      id: 'modis', 
      name: 'MODIS', 
      provider: 'NASA',
      resolution: '250m',
      revisit: '1-2 jours',
      bands: ['RGB', 'NIR', 'SWIR', 'TIR'],
      color: 'red'
    }
  ]

  // Indices de végétation et environnement
  const indices = [
    { name: 'NDVI', description: 'Normalized Difference Vegetation Index', range: '-1 à 1' },
    { name: 'NDWI', description: 'Normalized Difference Water Index', range: '-1 à 1' },
    { name: 'NDBI', description: 'Normalized Difference Built-up Index', range: '-1 à 1' },
    { name: 'SAVI', description: 'Soil Adjusted Vegetation Index', range: '-1 à 1' }
  ]

  useEffect(() => {
    setLoading(true)
    
    const processData = () => {
      // Simulation d'analyse satellitaire
      const satellite = satellites.find(s => s.id === selectedSatellite)
      
      // Corrélation avec les données de terrain
      const correlationData = {
        totalPoints: collectes.length + depots.length,
        vegetationHealth: Math.random() * 40 + 60, // 60-100%
        waterQuality: Math.random() * 30 + 70, // 70-100%
        urbanExpansion: Math.random() * 20 + 10, // 10-30%
        wasteHotspots: depots.length,
        collectionEfficiency: collectes.length > 0 
          ? (collectes.filter(c => c.termine).length / collectes.length * 100).toFixed(1)
          : 0
      }

      // Données temporelles simulées
      const temporalData = []
      for (let i = 0; i < 12; i++) {
        const date = new Date(2024, i, 1)
        temporalData.push({
          month: date.toLocaleDateString('fr-FR', { month: 'long' }),
          ndvi: (Math.random() * 0.4 + 0.3).toFixed(2),
          ndwi: (Math.random() * 0.3 + 0.1).toFixed(2),
          wasteDensity: Math.floor(Math.random() * 50 + 10),
          vegetationCover: Math.floor(Math.random() * 30 + 40)
        })
      }

      setAnalysisData({
        satellite,
        correlationData,
        temporalData,
        selectedDate
      })
      setLoading(false)
    }

    setTimeout(processData, 800)
  }, [selectedSatellite, selectedDate, collectes, depots])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="eco-card rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Données satellitaires</h2>
            <p className="text-gray-600">
              Intégration des données Sentinel-2, Landsat et GNSS pour l'analyse des changements environnementaux
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedSatellite}
              onChange={(e) => setSelectedSatellite(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {satellites.map(sat => (
                <option key={sat.id} value={sat.id}>
                  {sat.name} ({sat.provider})
                </option>
              ))}
            </select>
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Informations du satellite sélectionné */}
        {analysisData?.satellite && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-12 h-12 bg-${analysisData.satellite.color}-100 rounded-full flex items-center justify-center`}>
                <span className="text-2xl">🛰️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{analysisData.satellite.name}</h3>
                <p className="text-gray-600">{analysisData.satellite.provider}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analysisData.satellite.resolution}</div>
                <div className="text-sm text-gray-600">Résolution</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysisData.satellite.revisit}</div>
                <div className="text-sm text-gray-600">Révisite</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysisData.satellite.bands.length}</div>
                <div className="text-sm text-gray-600">Bandes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">95%</div>
                <div className="text-sm text-gray-600">Couverture</div>
              </div>
            </div>
          </div>
        )}

        {/* Corrélation avec données terrain */}
        {analysisData?.correlationData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Santé végétale</p>
                  <p className="text-2xl font-bold text-green-900">{analysisData.correlationData.vegetationHealth.toFixed(1)}%</p>
                  <p className="text-xs text-green-600">Basé sur NDVI</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">🌱</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Qualité de l'eau</p>
                  <p className="text-2xl font-bold text-blue-900">{analysisData.correlationData.waterQuality.toFixed(1)}%</p>
                  <p className="text-xs text-blue-600">Basé sur NDWI</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💧</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Expansion urbaine</p>
                  <p className="text-2xl font-bold text-orange-900">{analysisData.correlationData.urbanExpansion.toFixed(1)}%</p>
                  <p className="text-xs text-orange-600">Basé sur NDBI</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">🏙️</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Points de déchets</p>
                  <p className="text-2xl font-bold text-red-900">{analysisData.correlationData.wasteHotspots}</p>
                  <p className="text-xs text-red-600">Signalés sur le terrain</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">🗑️</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Efficacité collecte</p>
                  <p className="text-2xl font-bold text-purple-900">{analysisData.correlationData.collectionEfficiency}%</p>
                  <p className="text-xs text-purple-600">Collectes terminées</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Points totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{analysisData.correlationData.totalPoints}</p>
                  <p className="text-xs text-gray-600">Données terrain</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-lg">📍</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Évolution temporelle */}
        {analysisData?.temporalData && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution temporelle des indices</h3>
            <div className="space-y-3">
              {analysisData.temporalData.map((month: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-600">{month.month}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600">NDVI: {month.ndvi}</div>
                      <div className="text-xs text-gray-500">Végétation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-600">NDWI: {month.ndwi}</div>
                      <div className="text-xs text-gray-500">Eau</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-red-600">{month.wasteDensity}</div>
                      <div className="text-xs text-gray-500">Déchets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-purple-600">{month.vegetationCover}%</div>
                      <div className="text-xs text-gray-500">Couverture</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Indices disponibles */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Indices de télédétection disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indices.map((index, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{index.name}</span>
                  <span className="text-sm text-gray-500">{index.range}</span>
                </div>
                <p className="text-sm text-gray-600">{index.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
