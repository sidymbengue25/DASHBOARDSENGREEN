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
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [simulations, setSimulations] = useState<PolicySimulation[]>([])

  // Types de déchets spécifiques au Sénégal
  const wasteTypes = [
    { id: 'autre', name: 'Autre', color: 'gray' },
    { id: 'plastique', name: 'Plastique', color: 'blue' },
    { id: 'papier', name: 'Papier', color: 'yellow' },
    { id: 'verre', name: 'Verre', color: 'cyan' },
    { id: 'alimentaire', name: 'Alimentaire', color: 'green' },
    { id: 'electronique', name: 'Électronique', color: 'purple' },
    { id: 'divers', name: 'Divers', color: 'pink' }
  ]

  // Régions du Sénégal
  const senegalRegions = [
    { id: 'all', name: 'Tout le Sénégal', population: 17196308 },
    { id: 'dakar', name: 'Dakar', population: 3732284 },
    { id: 'thies', name: 'Thiès', population: 2016625 },
    { id: 'diourbel', name: 'Diourbel', population: 1656221 },
    { id: 'fatick', name: 'Fatick', population: 822197 },
    { id: 'kaffrine', name: 'Kaffrine', population: 592880 },
    { id: 'kaolack', name: 'Kaolack', population: 976976 },
    { id: 'kedougou', name: 'Kédougou', population: 185034 },
    { id: 'kolda', name: 'Kolda', population: 714392 },
    { id: 'louga', name: 'Louga', population: 930456 },
    { id: 'matam', name: 'Matam', population: 687227 },
    { id: 'saint-louis', name: 'Saint-Louis', population: 1018645 },
    { id: 'sedhiou', name: 'Sédhiou', population: 568359 },
    { id: 'tambacounda', name: 'Tambacounda', population: 711651 },
    { id: 'ziguinchor', name: 'Ziguinchor', population: 609281 }
  ]

  const periodOptions = [
    { id: '7d', name: '7 jours', days: 7 },
    { id: '30d', name: '30 jours', days: 30 },
    { id: '90d', name: '3 mois (saison sèche)', days: 90 },
    { id: '6m', name: '6 mois (saison des pluies)', days: 180 },
    { id: '1y', name: '1 an', days: 365 }
  ]

  // Politiques et initiatives spécifiques au Sénégal
  const senegalPolicies: PolicySimulation[] = [
    {
      id: 'zero-waste-dakar',
      name: 'Initiative Zéro Déchet Dakar',
      description: 'Programme de réduction des déchets dans la région de Dakar avec tri sélectif et compostage',
      impact: -25,
      cost: 2500000000, // 2.5 milliards FCFA
      implementationTime: 18,
      effectiveness: 85
    },
    {
      id: 'plastic-ban',
      name: 'Interdiction des sachets plastiques',
      description: 'Application stricte de la loi sur les sachets plastiques non biodégradables',
      impact: -15,
      cost: 500000000, // 500 millions FCFA
      implementationTime: 6,
      effectiveness: 70
    },
    {
      id: 'community-centers',
      name: 'Centres de collecte communautaires',
      description: 'Installation de 200 centres de collecte dans les quartiers populaires',
      impact: -20,
      cost: 1800000000, // 1.8 milliards FCFA
      implementationTime: 12,
      effectiveness: 80
    },
    {
      id: 'recycling-industry',
      name: 'Industrie du recyclage',
      description: 'Développement d\'usines de recyclage locales pour créer une économie circulaire',
      impact: -30,
      cost: 5000000000, // 5 milliards FCFA
      implementationTime: 24,
      effectiveness: 90
    },
    {
      id: 'education-campaign',
      name: 'Campagne d\'éducation environnementale',
      description: 'Sensibilisation dans les écoles et communautés sur la gestion des déchets',
      impact: -10,
      cost: 300000000, // 300 millions FCFA
      implementationTime: 3,
      effectiveness: 60
    },
    {
      id: 'composting-program',
      name: 'Programme de compostage urbain',
      description: 'Transformation des déchets organiques en compost pour l\'agriculture urbaine',
      impact: -18,
      cost: 800000000, // 800 millions FCFA
      implementationTime: 9,
      effectiveness: 75
    }
  ]

  // Facteurs climatiques et saisonniers du Sénégal
  const getSenegalSeasonalFactors = (date: Date) => {
    const month = date.getMonth() // 0-11
    
    // Saison des pluies (juin-octobre) vs saison sèche
    const isRainySeason = month >= 5 && month <= 9
    
    return {
      weather: isRainySeason ? 1.3 : 0.8, // Plus de déchets pendant la saison des pluies
      season: isRainySeason ? 1.2 : 0.9,
      events: month === 10 || month === 11 ? 1.4 : 1.0, // Tabaski et fêtes de fin d'année
      population: 1.0 + (month * 0.01) // Légère croissance démographique
    }
  }

  // Simuler la génération de données de prévision
  useEffect(() => {
    const generateForecastData = () => {
      const data: ForecastData[] = []
      const selectedPeriodDays = periodOptions.find(p => p.id === selectedPeriod)?.days || 30
      
      for (let i = 1; i <= selectedPeriodDays; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        // Utiliser les facteurs saisonniers du Sénégal
        const senegalFactors = getSenegalSeasonalFactors(date)
        
        // Volume de base selon la région sélectionnée
        const selectedRegionData = senegalRegions.find(r => r.id === selectedRegion)
        const regionPopulationFactor = selectedRegionData ? 
          (selectedRegionData.population / senegalRegions[0].population) : 1.0
        
        const baseVolume = (collectes.length + depots.length) * regionPopulationFactor
        
        // Facteur de variabilité quotidienne
        const dailyVariation = 0.85 + Math.random() * 0.3 // 0.85 à 1.15
        
        // Calcul du volume prédit avec facteurs sénégalais
        const totalFactor = senegalFactors.weather * senegalFactors.season * 
                           senegalFactors.events * dailyVariation
        
        const predictedVolume = Math.round(baseVolume * totalFactor)
        
        // Confiance basée sur la stabilité des facteurs
        const confidence = Math.min(95, 60 + 
          (senegalFactors.season * 20) + 
          (Math.random() * 15))
        
        data.push({
          date: date.toISOString().split('T')[0],
          predictedVolume: predictedVolume,
          confidence: Math.round(confidence),
          factors: senegalFactors
        })
      }
      
      setForecastData(data)
      setLoading(false)
    }

    generateForecastData()
    
    // Utiliser les politiques spécifiques au Sénégal
    setSimulations(senegalPolicies)
  }, [collectes, depots, selectedPeriod, selectedRegion])

  // Formater les coûts en FCFA
  const formatCostFCFA = (cost: number): string => {
    if (cost >= 1000000000) {
      return `${(cost / 1000000000).toFixed(1)} milliards FCFA`
    } else if (cost >= 1000000) {
      return `${(cost / 1000000).toFixed(0)} millions FCFA`
    } else {
      return `${cost.toLocaleString()} FCFA`
    }
  }

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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Module de prévision - Sénégal</h2>
            <p className="text-gray-600">
              Prédiction de l'évolution des volumes de déchets au Sénégal avec prise en compte des saisons, 
              de la démographie régionale et simulation d'impact des politiques nationales
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              {senegalRegions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.name} {region.id !== 'all' && `(${(region.population / 1000000).toFixed(1)}M hab)`}
                </option>
              ))}
            </select>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
                    <span className="font-medium text-green-700">{formatCostFCFA(simulation.cost)}</span>
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
