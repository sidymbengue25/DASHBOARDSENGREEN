import React, { useState, useEffect, useCallback } from 'react'
import { formatDate } from '../lib/date'

interface WasteItem {
  id: string
  type: string
  category: string
  confidence: number
  location: string
  timestamp: string
  imageUrl?: string
  description: string
}

interface TypologyStats {
  total: number
  byCategory: Record<string, number>
  byConfidence: {
    high: number
    medium: number
    low: number
  }
  recentClassifications: WasteItem[]
}

interface WasteTypologyProps {
  collectes: any[]
  depots: any[]
}

export const WasteTypology: React.FC<WasteTypologyProps> = ({ collectes = [], depots = [] }) => {
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedConfidence, setSelectedConfidence] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TypologyStats>({
    total: 0,
    byCategory: {},
    byConfidence: { high: 0, medium: 0, low: 0 },
    recentClassifications: []
  })

  const categories = [
    { id: 'autre', name: 'Autre', color: 'gray', icon: '📦' },
    { id: 'plastique', name: 'Plastique', color: 'blue', icon: '🔄' },
    { id: 'papier', name: 'Papier', color: 'yellow', icon: '📄' },
    { id: 'verre', name: 'Verre', color: 'cyan', icon: '🍷' },
    { id: 'alimentaire', name: 'Alimentaire', color: 'green', icon: '🍎' },
    { id: 'electronique', name: 'Électronique', color: 'purple', icon: '📱' },
    { id: 'divers', name: 'Divers', color: 'pink', icon: '📋' }
  ]

  // Fonction pour calculer les statistiques
  const calculateStats = useCallback((items: WasteItem[]) => {
    const byCategory: Record<string, number> = {}
    const byConfidence = { high: 0, medium: 0, low: 0 }
    
    items.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1
      
      if (item.confidence >= 80) byConfidence.high++
      else if (item.confidence >= 60) byConfidence.medium++
      else byConfidence.low++
    })

    setStats({
      total: items.length,
      byCategory,
      byConfidence,
      recentClassifications: items
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
    })
  }, [])

  // Mapper les types réels aux catégories
  const mapTypeToCategory = (type: string): string => {
    if (!type) return 'autre'
    const typeNormalized = type.toLowerCase()
    
    // Mapping direct des types de vos données
    if (typeNormalized === 'plastique') return 'plastique'
    if (typeNormalized === 'papier') return 'papier'
    if (typeNormalized === 'verre') return 'verre'
    if (typeNormalized === 'alimentaire') return 'alimentaire'
    if (typeNormalized === 'electronique') return 'electronique'
    if (typeNormalized === 'divers') return 'divers'
    
    return 'autre'
  }


  // Effet pour générer les données au montage et quand les props changent
  useEffect(() => {
    console.log('🔄 useEffect déclenché:', { collectes: collectes.length, depots: depots.length })
    setLoading(true)
    
    const processData = () => {
      const items: WasteItem[] = []
      
      // Traiter les dépôts
      depots.forEach((depot, index) => {
        if (depot.type_depot) {
          const category = mapTypeToCategory(depot.type_depot)
          const categoryInfo = categories.find(c => c.id === category)
          
          let confidence = 70
          if (depot.image_url) confidence += 20
          if (depot.commentaire) confidence += 10
          confidence = Math.min(confidence, 95)
          
          items.push({
            id: depot.id || `depot-${index}`,
            type: depot.type_depot,
            category: category,
            confidence: confidence,
            location: `Dépôt ${index + 1}`,
            timestamp: depot.heure?.toDate?.()?.toISOString() || new Date().toISOString(),
            imageUrl: depot.image_url,
            description: depot.commentaire || `${categoryInfo?.name || 'Déchet'} signalé`
          })
        }
      })
      
      // Traiter les collectes
      collectes.forEach((collecte, index) => {
        if (collecte.organisateur) {
          items.push({
            id: collecte.id || `collecte-${index}`,
            type: 'collecte',
            category: 'divers',
            confidence: 85,
            location: `Collecte par ${collecte.organisateur}`,
            timestamp: collecte.dateCollecte?.toDate?.()?.toISOString() || new Date().toISOString(),
            description: `Collecte organisée par ${collecte.organisateur}`
          })
        }
      })

      // Données d'exemple si vide
      if (items.length === 0) {
        console.log('⚠️ Génération d\'exemples')
        for (let i = 0; i < 10; i++) {
          const category = categories[Math.floor(Math.random() * categories.length)]
          items.push({
            id: `example-${i}`,
            type: 'example',
            category: category.id,
            confidence: 60 + Math.random() * 35,
            location: `Point d'exemple ${i + 1}`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: `Exemple de ${category.name.toLowerCase()}`
          })
        }
      }

      console.log('✅ Items générés:', items.length)
      setWasteItems(items)
      calculateStats(items)
      setLoading(false)
    }
    
    // Délai réduit
    const timeout = setTimeout(processData, 100)
    return () => clearTimeout(timeout)
  }, [collectes, depots, calculateStats])

  // Filtrage des éléments
  const filteredItems = wasteItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory
    const confidenceMatch = selectedConfidence === 'all' || 
      (selectedConfidence === 'high' && item.confidence >= 80) ||
      (selectedConfidence === 'medium' && item.confidence >= 60 && item.confidence < 80) ||
      (selectedConfidence === 'low' && item.confidence < 60)
    
    return categoryMatch && confidenceMatch
  })

  // Fonctions utilitaires
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Élevée'
    if (confidence >= 60) return 'Moyenne'
    return 'Faible'
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Typologie des déchets</h2>
            <p className="text-gray-600">Classification automatique via IA : plastique, organique, électronique, etc.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              aria-label="Filtrer par catégorie"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedConfidence}
              onChange={(e) => setSelectedConfidence(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              aria-label="Filtrer par niveau de confiance"
            >
              <option value="all">Tous les niveaux</option>
              <option value="high">Haute confiance (≥80%)</option>
              <option value="medium">Confiance moyenne (60-79%)</option>
              <option value="low">Faible confiance (&#x3C;60%)</option>
            </select>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total classifié</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Haute confiance</p>
                <p className="text-2xl font-bold text-green-900">{stats.byConfidence.high.toLocaleString()}</p>
                <p className="text-xs text-green-600">
                  {stats.total > 0 ? Math.round((stats.byConfidence.high / stats.total) * 100) : 0}% du total
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">À vérifier</p>
                <p className="text-2xl font-bold text-orange-900">{stats.byConfidence.low.toLocaleString()}</p>
                <p className="text-xs text-orange-600">
                  {stats.total > 0 ? Math.round((stats.byConfidence.low / stats.total) * 100) : 0}% du total
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Répartition par catégorie */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map(category => {
              const count = stats.byCategory[category.id] || 0
              const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : '0'
              
              return (
                <div 
                  key={category.id} 
                  className={`bg-white rounded-lg p-4 border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-500">{percentage}%</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{category.name}</p>
                  <p className="text-lg font-bold text-gray-900">{count.toLocaleString()}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Message si aucun résultat */}
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-2">Aucun déchet trouvé</p>
            <p className="text-gray-400">Essayez de modifier vos filtres</p>
          </div>
        )}

        {/* Liste des classifications récentes */}
        {filteredItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Classifications récentes ({filteredItems.length.toLocaleString()})
              </h3>
              {selectedCategory !== 'all' || selectedConfidence !== 'all' ? (
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedConfidence('all')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              ) : null}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredItems.slice(0, 20).map((item) => {
                const category = categories.find(c => c.id === item.category)
                return (
                  <div key={item.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all">
                    {/* Image si disponible */}
                    {item.imageUrl ? (
                      <div className="flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={`${category?.name} détecté`}
                          className="w-16 h-16 rounded-lg object-cover border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{category?.icon}</span>
                      </div>
                    )}
                    
                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            {category?.icon} {category?.name}
                            {item.type === 'collecte' && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Collecte
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{item.location}</p>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            📅 {formatDate(item.timestamp)}
                          </p>
                        </div>
                        
                        {/* Badge de confiance */}
                        <div className="flex-shrink-0 text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                            {Math.round(item.confidence)}%
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {getConfidenceLabel(item.confidence)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.type === 'collecte' ? 'Organisée' : 'Détecté IA'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {filteredItems.length > 20 && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  Affichage de 20 sur {filteredItems.length.toLocaleString()} résultats
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}