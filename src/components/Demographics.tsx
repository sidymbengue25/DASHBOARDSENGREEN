import React, { useState, useEffect } from 'react'
import { parsePosition } from '../lib/geo'
import { formatDate } from '../lib/date'

interface DemographicData {
  zone: string
  population: number
  densityPerKm2: number
  revenueLevel: 'low' | 'medium' | 'high'
  wasteCount: number
  collecteCount: number
  depotCount: number
  wastePerCapita: number
  mainActivity: string
  coordinates: [number, number]
}

interface DemographicsProps {
  collectes: any[]
  depots: any[]
}

const Demographics: React.FC<DemographicsProps> = ({ collectes, depots }) => {
  const [demographicZones, setDemographicZones] = useState<DemographicData[]>([])
  const [selectedMetric, setSelectedMetric] = useState<'population' | 'waste' | 'revenue'>('waste')
  const [loading, setLoading] = useState(true)

  // Données démographiques simulées pour les zones du Sénégal
  const senegalZones = [
    { 
      name: 'Dakar Centre', 
      population: 1200000, 
      area: 83, 
      revenue: 'high' as const,
      activity: 'Services/Commerce',
      baseCoords: [14.7167, -17.4677]
    },
    { 
      name: 'Pikine-Guédiawaye', 
      population: 1400000, 
      area: 200, 
      revenue: 'medium' as const,
      activity: 'Industrie/Résidentiel',
      baseCoords: [14.7500, -17.4000]
    },
    { 
      name: 'Rufisque', 
      population: 350000, 
      area: 130, 
      revenue: 'medium' as const,
      activity: 'Industrie/Pêche',
      baseCoords: [14.7167, -17.2667]
    },
    { 
      name: 'Thiès', 
      population: 400000, 
      area: 150, 
      revenue: 'medium' as const,
      activity: 'Agriculture/Commerce',
      baseCoords: [14.7833, -16.9333]
    },
    { 
      name: 'Saint-Louis', 
      population: 280000, 
      area: 240, 
      revenue: 'low' as const,
      activity: 'Tourisme/Pêche',
      baseCoords: [16.0200, -16.4844]
    },
    { 
      name: 'Kaolack', 
      population: 250000, 
      area: 180, 
      revenue: 'low' as const,
      activity: 'Agriculture/Commerce',
      baseCoords: [14.1500, -16.0833]
    },
    { 
      name: 'Ziguinchor', 
      population: 200000, 
      area: 320, 
      revenue: 'low' as const,
      activity: 'Agriculture/Tourisme',
      baseCoords: [12.5600, -16.2700]
    },
    { 
      name: 'Diourbel', 
      population: 180000, 
      area: 160, 
      revenue: 'low' as const,
      activity: 'Agriculture/Élevage',
      baseCoords: [14.6500, -16.2333]
    }
  ]

  // Calculer les distances entre points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Assigner les points à des zones
  const assignToZone = (coords: [number, number]) => {
    let closestZone = senegalZones[0]
    let minDistance = Infinity

    senegalZones.forEach(zone => {
      const distance = calculateDistance(
        coords[0], coords[1],
        zone.baseCoords[0], zone.baseCoords[1]
      )
      if (distance < minDistance) {
        minDistance = distance
        closestZone = zone
      }
    })

    return closestZone
  }

  useEffect(() => {
    setLoading(true)
    
    const processData = () => {
      const zoneStats = new Map<string, {
        collecteCount: number
        depotCount: number
        totalWaste: number
      }>()

      // Initialiser les zones
      senegalZones.forEach(zone => {
        zoneStats.set(zone.name, {
          collecteCount: 0,
          depotCount: 0,
          totalWaste: 0
        })
      })

      // Traiter les collectes
      collectes.forEach(collecte => {
        const coords = parsePosition(collecte.position || collecte.location)
        if (coords) {
          const zone = assignToZone(coords)
          const stats = zoneStats.get(zone.name)!
          stats.collecteCount++
          stats.totalWaste++
        }
      })

      // Traiter les dépôts
      depots.forEach(depot => {
        const coords = parsePosition(depot.position || depot.location)
        if (coords) {
          const zone = assignToZone(coords)
          const stats = zoneStats.get(zone.name)!
          stats.depotCount++
          stats.totalWaste++
        }
      })

      // Créer les données démographiques finales
      const demographicData: DemographicData[] = senegalZones.map(zone => {
        const stats = zoneStats.get(zone.name)!
        const densityPerKm2 = zone.population / zone.area
        const wastePerCapita = zone.population > 0 ? (stats.totalWaste / zone.population) * 1000 : 0

        return {
          zone: zone.name,
          population: zone.population,
          densityPerKm2: Math.round(densityPerKm2),
          revenueLevel: zone.revenue,
          wasteCount: stats.totalWaste,
          collecteCount: stats.collecteCount,
          depotCount: stats.depotCount,
          wastePerCapita: Math.round(wastePerCapita * 100) / 100,
          mainActivity: zone.activity,
          coordinates: zone.baseCoords
        }
      })

      setDemographicZones(demographicData)
      setLoading(false)
    }

    setTimeout(processData, 200)
  }, [collectes, depots])

  const getRevenueColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRevenueLabel = (level: string) => {
    switch (level) {
      case 'high': return 'Élevé'
      case 'medium': return 'Moyen'
      case 'low': return 'Faible'
      default: return 'N/A'
    }
  }

  const sortedZones = [...demographicZones].sort((a, b) => {
    switch (selectedMetric) {
      case 'population': return b.population - a.population
      case 'waste': return b.wastePerCapita - a.wastePerCapita
      case 'revenue': 
        const revenueOrder = { high: 3, medium: 2, low: 1 }
        return revenueOrder[b.revenueLevel] - revenueOrder[a.revenueLevel]
      default: return 0
    }
  })

  const totalPopulation = demographicZones.reduce((sum, zone) => sum + zone.population, 0)
  const totalWaste = demographicZones.reduce((sum, zone) => sum + zone.wasteCount, 0)
  const avgWastePerCapita = totalPopulation > 0 ? (totalWaste / totalPopulation) * 1000 : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="eco-card rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="eco-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyse démographique</h2>
            <p className="text-gray-600">
              Corrélation entre niveau de déchets, densité de population et activité économique
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="waste">Trier par déchets/habitant</option>
              <option value="population">Trier par population</option>
              <option value="revenue">Trier par niveau de revenu</option>
            </select>
          </div>
        </div>

        {/* KPIs globaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Population totale</p>
                <p className="text-2xl font-bold text-blue-900">{totalPopulation.toLocaleString()}</p>
                <p className="text-xs text-blue-600">{demographicZones.length} zones analysées</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total déchets</p>
                <p className="text-2xl font-bold text-green-900">{totalWaste.toLocaleString()}</p>
                <p className="text-xs text-green-600">Points signalés</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">🗑️</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Moy. déchets/1000 hab</p>
                <p className="text-2xl font-bold text-purple-900">{avgWastePerCapita.toFixed(2)}</p>
                <p className="text-xs text-purple-600">Ratio national</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Zones à risque</p>
                <p className="text-2xl font-bold text-orange-900">
                  {demographicZones.filter(z => z.wastePerCapita > avgWastePerCapita).length}
                </p>
                <p className="text-xs text-orange-600">Au-dessus de la moyenne</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-lg">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des zones */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Population
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Densité/km²
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau de revenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Déchets/1000 hab
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activité principale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedZones.map((zone, index) => (
                <tr key={zone.zone} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{zone.zone}</div>
                        <div className="text-sm text-gray-500">
                          {zone.coordinates[0].toFixed(4)}, {zone.coordinates[1].toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{zone.population.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{zone.densityPerKm2.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRevenueColor(zone.revenueLevel)}`}>
                      {getRevenueLabel(zone.revenueLevel)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{zone.wastePerCapita}</div>
                    <div className={`text-xs ${zone.wastePerCapita > avgWastePerCapita ? 'text-red-600' : 'text-green-600'}`}>
                      {zone.wastePerCapita > avgWastePerCapita ? '↑ Au-dessus' : '↓ En-dessous'} de la moyenne
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{zone.mainActivity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>🗂️ {zone.collecteCount} collectes</div>
                    <div>🗑️ {zone.depotCount} dépôts</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">🏙️ Zones urbaines denses</h3>
            <div className="space-y-2">
              {demographicZones
                .filter(z => z.densityPerKm2 > 5000)
                .slice(0, 3)
                .map(zone => (
                  <div key={zone.zone} className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">{zone.zone}</span>
                    <span className="text-sm font-medium text-blue-900">
                      {zone.densityPerKm2.toLocaleString()} hab/km²
                    </span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border border-red-100">
            <h3 className="text-lg font-semibold text-red-900 mb-3">⚠️ Zones problématiques</h3>
            <div className="space-y-2">
              {demographicZones
                .filter(z => z.wastePerCapita > avgWastePerCapita)
                .slice(0, 3)
                .map(zone => (
                  <div key={zone.zone} className="flex justify-between items-center">
                    <span className="text-sm text-red-700">{zone.zone}</span>
                    <span className="text-sm font-medium text-red-900">
                      {zone.wastePerCapita} déchets/1000 hab
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Demographics
