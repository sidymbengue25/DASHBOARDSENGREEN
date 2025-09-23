import React, { useState, useEffect } from 'react'

interface ForecastData {
  date: string
  predictedVolume: number
  confidence: number
  factors: {
    weather: number
    season: number
    events: number
    population: number
  }
}

interface PolicySimulation {
  id: string
  name: string
  description: string
  impact: number // pourcentage d'impact
  cost: number
  implementationTime: number // en mois
  effectiveness: number // score de 0 à 100
}

interface ForecastingModuleProps {
  collectes: any[]
  depots: any[]
}

export const ForecastingModule: React.FC<ForecastingModuleProps> = ({ collectes, depots }) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d')
  const [selectedWasteType, setSelectedWasteType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [simulations, setSimulations] = useState<PolicySimulation[]>([])

  const wasteTypes = [
    { id: 'autre', name: 'Autre', color: 'gray' },
    { id: 'plastique', name: 'Plastique', color: 'blue' },
    { id: 'papier', name: 'Papier', color: 'yellow' },
    { id: 'verre', name: 'Verre', color: 'cyan' },
    { id: 'alimentaire', name: 'Alimentaire', color: 'green' },
    { id: 'electronique', name: 'Électronique', color: 'purple' },
    { id: 'divers', name: 'Divers', color: 'pink' }
  ]

  const periodOptions = [
    { id: '7d', name: '7 jours', days: 7 },
    { id: '30d', name: '30 jours', days: 30 },
    { id: '90d', name: '90 jours', days: 90 },
    { id: '1y', name: '1 an', days: 365 }
  ]

  // Simuler la génération de données de prévision
  useEffect(() => {
    const generateForecastData = () => {
      const data: ForecastData[] = []
      const selectedPeriodDays = periodOptions.find(p => p.id === selectedPeriod)?.days || 30
      
      for (let i = 1; i <= selectedPeriodDays; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        // Simulation de prédiction basée sur les données existantes
        const baseVolume = collectes.length + depots.length
        const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.3 + 0.7
        const weatherFactor = Math.random() * 0.4 + 0.8
        const eventFactor = Math.random() > 0.9 ? 1.5 : 1.0
        
        data.push({
          date: date.toISOString(),
          predictedVolume: Math.round(baseVolume * seasonalFactor * weatherFactor * eventFactor),
          confidence: Math.random() * 20 + 70, // 70-90%
          factors: {
            weather: weatherFactor,
            season: seasonalFactor,
            events: eventFactor,
            population: Math.random() * 0.2 + 0.9
          }
        })
      }
      
      setForecastData(data)
      setLoading(false)
    }

    generateForecastData()
  }, [collectes, depots, selectedPeriod])

  // Simuler les simulations de politiques
  useEffect(() => {
    const policySimulations: PolicySimulation[] = [
      {
        id: 'bins',
        name: 'Déploiement de bacs intelligents',
        description: 'Installation de bacs connectés avec capteurs de remplissage',
        impact: 25,
        cost: 150000,
        implementationTime: 6,
        effectiveness: 85
      },
      {
        id: 'awareness',
        name: 'Campagne de sensibilisation',
        description: 'Programme éducatif pour réduire les déchets à la source',
        impact: 15,
        cost: 50000,
        implementationTime: 3,
        effectiveness: 70
      },
      {
        id: 'incentives',
        name: 'Système d\'incitation',
        description: 'Récompenses pour les citoyens qui trient correctement',
        impact: 30,
        cost: 80000,
        implementationTime: 4,
        effectiveness: 90
      },
      {
        id: 'collection',
        name: 'Optimisation des collectes',
        description: 'Amélioration des routes et fréquences de collecte',
        impact: 20,
        cost: 100000,
        implementationTime: 8,
        effectiveness: 75
      }
    ]
    
    setSimulations(policySimulations)
  }, [])

  const filteredData = forecastData.filter(item => {
    if (selectedWasteType === 'all') return true
    // Simulation basée sur le type de déchet
    return Math.random() > 0.5
  })

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-100'
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getImpactColor = (impact: number) => {
    if (impact >= 25) return 'text-green-600 bg-green-100'
    if (impact >= 15) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Module de prévision</h2>
            <p className="text-gray-600">Prédiction de l'évolution des volumes de déchets via machine learning et simulation d'impact des politiques</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {periodOptions.map(period => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedWasteType}
              onChange={(e) => setSelectedWasteType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les types</option>
              {wasteTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Graphique de prévision */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prédiction des volumes</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-8 gap-2 mb-4">
              {filteredData.slice(0, 32).map((item, index) => {
                const height = Math.min((item.predictedVolume / Math.max(...filteredData.map(d => d.predictedVolume))) * 100, 100)
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.date).getDate()}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Volume prédit (unités)</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Prédiction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span>Données historiques</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métriques de confiance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confiance moyenne</h3>
            <p className="text-3xl font-bold text-blue-600">
              {Math.round(filteredData.reduce((acc, item) => acc + item.confidence, 0) / filteredData.length)}%
            </p>
            <p className="text-sm text-gray-500">Précision du modèle ML</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Volume prévu</h3>
            <p className="text-3xl font-bold text-green-600">
              {Math.round(filteredData.reduce((acc, item) => acc + item.predictedVolume, 0))}
            </p>
            <p className="text-sm text-gray-500">Total sur la période</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tendance</h3>
            <p className="text-3xl font-bold text-orange-600">
              {filteredData.length > 1 ? 
                (filteredData[filteredData.length - 1].predictedVolume > filteredData[0].predictedVolume ? '+' : '-') + 
                Math.round(Math.abs(filteredData[filteredData.length - 1].predictedVolume - filteredData[0].predictedVolume) / filteredData[0].predictedVolume * 100) + '%'
                : '0%'
              }
            </p>
            <p className="text-sm text-gray-500">Évolution prévue</p>
          </div>
        </div>

        {/* Simulations de politiques */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulations de politiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {simulations.map((simulation) => (
              <div key={simulation.id} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{simulation.name}</h4>
                    <p className="text-sm text-gray-600">{simulation.description}</p>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(simulation.impact)}`}>
                    {simulation.impact}% d'impact
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Coût d'implémentation</span>
                    <span className="font-medium">{simulation.cost.toLocaleString()} €</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Durée d'implémentation</span>
                    <span className="font-medium">{simulation.implementationTime} mois</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Efficacité</span>
                    <span className="font-medium">{simulation.effectiveness}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${simulation.effectiveness}%` }}
                    ></div>
                  </div>
                </div>
                
                <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Simuler l'impact
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Facteurs d'influence */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Facteurs d'influence</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">Météo</span>
                <span className="text-lg font-bold text-blue-900">
                  {Math.round(filteredData.reduce((acc, item) => acc + item.factors.weather, 0) / filteredData.length * 100)}%
                </span>
              </div>
              <p className="text-xs text-blue-600">Impact météorologique</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-600">Saison</span>
                <span className="text-lg font-bold text-green-900">
                  {Math.round(filteredData.reduce((acc, item) => acc + item.factors.season, 0) / filteredData.length * 100)}%
                </span>
              </div>
              <p className="text-xs text-green-600">Facteur saisonnier</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-600">Événements</span>
                <span className="text-lg font-bold text-orange-900">
                  {Math.round(filteredData.reduce((acc, item) => acc + item.factors.events, 0) / filteredData.length * 100)}%
                </span>
              </div>
              <p className="text-xs text-orange-600">Impact des événements</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-600">Population</span>
                <span className="text-lg font-bold text-purple-900">
                  {Math.round(filteredData.reduce((acc, item) => acc + item.factors.population, 0) / filteredData.length * 100)}%
                </span>
              </div>
              <p className="text-xs text-purple-600">Densité démographique</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
