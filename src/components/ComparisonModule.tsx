import React, { useState, useEffect } from 'react'
import { formatDate } from '../lib/date'

interface ComparisonModuleProps {
  collectes: any[]
  depots: any[]
  historiqueDepots: any[]
}

export const ComparisonModule: React.FC<ComparisonModuleProps> = ({ 
  collectes, 
  depots, 
  historiqueDepots 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedZone, setSelectedZone] = useState('all')
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Zones géographiques du Sénégal
  const zones = [
    { id: 'all', name: 'Tout le Sénégal', color: 'blue' },
    { id: 'dakar', name: 'Dakar', color: 'green' },
    { id: 'thies', name: 'Thiès', color: 'yellow' },
    { id: 'saint-louis', name: 'Saint-Louis', color: 'purple' },
    { id: 'kaolack', name: 'Kaolack', color: 'red' },
    { id: 'ziguinchor', name: 'Ziguinchor', color: 'indigo' }
  ]

  // Périodes de comparaison
  const periods = [
    { id: '7d', name: '7 derniers jours', days: 7 },
    { id: '30d', name: '30 derniers jours', days: 30 },
    { id: '90d', name: '3 derniers mois', days: 90 },
    { id: '1y', name: '1 an', days: 365 }
  ]

  useEffect(() => {
    setLoading(true)
    
    const processData = () => {
      const now = new Date()
      const periodDays = periods.find(p => p.id === selectedPeriod)?.days || 30
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
      
      // Filtrer les données par période
      const filteredCollectes = collectes.filter(c => {
        const date = c.dateCollecte?.toDate?.() || c.heureSave?.toDate?.() || new Date()
        return date >= startDate
      })
      
      const filteredDepots = depots.filter(d => {
        const date = d.heure?.toDate?.() || new Date()
        return date >= startDate
      })
      
      const filteredHistorique = historiqueDepots.filter(h => {
        const date = h.dateSignalement?.toDate?.() || new Date()
        return date >= startDate
      })

      // Calculer les statistiques
      const stats = {
        collectes: {
          total: filteredCollectes.length,
          terminees: filteredCollectes.filter(c => c.termine).length,
          enCours: filteredCollectes.filter(c => !c.termine).length,
          tauxCompletion: filteredCollectes.length > 0 
            ? (filteredCollectes.filter(c => c.termine).length / filteredCollectes.length * 100).toFixed(1)
            : 0
        },
        depots: {
          total: filteredDepots.length,
          ramasses: filteredDepots.filter(d => d.ramasse).length,
          enAttente: filteredDepots.filter(d => !d.ramasse).length,
          tauxRamassage: filteredDepots.length > 0 
            ? (filteredDepots.filter(d => d.ramasse).length / filteredDepots.length * 100).toFixed(1)
            : 0
        },
        historique: {
          total: filteredHistorique.length,
          ramasses: filteredHistorique.filter(h => h.etatDepot === 'ramasse').length
        }
      }

      // Évolution temporelle (par semaine)
      const weeklyData = []
      for (let i = periodDays; i >= 0; i -= 7) {
        const weekStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        const weekCollectes = filteredCollectes.filter(c => {
          const date = c.dateCollecte?.toDate?.() || c.heureSave?.toDate?.() || new Date()
          return date >= weekStart && date < weekEnd
        })
        
        const weekDepots = filteredDepots.filter(d => {
          const date = d.heure?.toDate?.() || new Date()
          return date >= weekStart && date < weekEnd
        })
        
        weeklyData.push({
          semaine: weekStart.toISOString().split('T')[0],
          collectes: weekCollectes.length,
          depots: weekDepots.length,
          ramassages: weekDepots.filter(d => d.ramasse).length
        })
      }

      setComparisonData({
        stats,
        weeklyData,
        period: selectedPeriod,
        zone: selectedZone
      })
      setLoading(false)
    }

    setTimeout(processData, 500)
  }, [selectedPeriod, selectedZone, collectes, depots, historiqueDepots])

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
      {/* En-tête avec contrôles */}
      <div className="eco-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comparaison spatio-temporelle</h2>
            <p className="text-gray-600">
              Évolution de la situation sur une période donnée et comparaison entre zones ou périodes
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques principales */}
        {comparisonData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Collectes</p>
                  <p className="text-2xl font-bold text-green-900">{comparisonData.stats.collectes.total}</p>
                  <p className="text-xs text-green-600">
                    {comparisonData.stats.collectes.tauxCompletion}% terminées
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">🗂️</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Dépôts signalés</p>
                  <p className="text-2xl font-bold text-red-900">{comparisonData.stats.depots.total}</p>
                  <p className="text-xs text-red-600">
                    {comparisonData.stats.depots.tauxRamassage}% ramassés
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">🗑️</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Historique</p>
                  <p className="text-2xl font-bold text-blue-900">{comparisonData.stats.historique.total}</p>
                  <p className="text-xs text-blue-600">
                    Traitements enregistrés
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📚</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Graphique d'évolution temporelle */}
        {comparisonData && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution temporelle</h3>
            <div className="space-y-4">
              {comparisonData.weeklyData.map((week: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-600">
                      Semaine du {new Date(week.semaine).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{week.collectes}</div>
                      <div className="text-xs text-gray-500">Collectes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{week.depots}</div>
                      <div className="text-xs text-gray-500">Dépôts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{week.ramassages}</div>
                      <div className="text-xs text-gray-500">Ramassages</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparaison des zones */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparaison des zones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.slice(1).map(zone => (
              <div key={zone.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full bg-${zone.color}-500`}></div>
                  <span className="font-medium text-gray-900">{zone.name}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Collectes: {Math.floor(Math.random() * 20) + 5}</div>
                  <div>Dépôts: {Math.floor(Math.random() * 30) + 10}</div>
                  <div>Taux: {Math.floor(Math.random() * 30) + 70}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
