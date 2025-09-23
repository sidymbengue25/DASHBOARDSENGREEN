import React, { useState, useEffect } from 'react'

interface Intervention {
  id: string
  type: 'municipal' | 'citizen' | 'emergency'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  location: string
  description: string
  assignedTo: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  responseTime?: number // en minutes
  efficiency: number // score de 0 à 100
}

interface InterventionStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  cancelled: number
  averageResponseTime: number
  averageEfficiency: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}

interface InterventionsTrackingProps {
  collectes: any[]
  depots: any[]
}

export const InterventionsTracking: React.FC<InterventionsTrackingProps> = ({ collectes, depots }) => {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<InterventionStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    averageResponseTime: 0,
    averageEfficiency: 0,
    byType: {},
    byPriority: {}
  })

  const statusOptions = [
    { id: 'pending', name: 'En attente', color: 'yellow', icon: '⏳' },
    { id: 'in_progress', name: 'En cours', color: 'blue', icon: '🔄' },
    { id: 'completed', name: 'Terminé', color: 'green', icon: '✅' },
    { id: 'cancelled', name: 'Annulé', color: 'red', icon: '❌' }
  ]

  const typeOptions = [
    { id: 'municipal', name: 'Municipale', color: 'blue', icon: '🏛️' },
    { id: 'citizen', name: 'Citoyenne', color: 'green', icon: '👥' },
    { id: 'emergency', name: 'Urgence', color: 'red', icon: '🚨' }
  ]

  const priorityOptions = [
    { id: 'low', name: 'Faible', color: 'green', icon: '🟢' },
    { id: 'medium', name: 'Moyenne', color: 'yellow', icon: '🟡' },
    { id: 'high', name: 'Élevée', color: 'orange', icon: '🟠' },
    { id: 'critical', name: 'Critique', color: 'red', icon: '🔴' }
  ]

  // Simuler la génération d'interventions
  useEffect(() => {
    const generateInterventions = () => {
      const interventions: Intervention[] = []
      
      // Générer des interventions basées sur les collectes et dépôts
      const allItems = [...(collectes || []), ...(depots || [])]
      
      allItems.forEach((item, index) => {
        const type = typeOptions[Math.floor(Math.random() * typeOptions.length)]
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]
        const priority = priorityOptions[Math.floor(Math.random() * priorityOptions.length)]
        const responseTime = Math.floor(Math.random() * 480) + 30 // 30min à 8h30
        const efficiency = Math.floor(Math.random() * 40) + 60 // 60% à 100%
        
        interventions.push({
          id: `intervention-${index}`,
          type: type.id as any,
          status: status.id as any,
          priority: priority.id as any,
          location: item.adresse || `Point ${index + 1}`,
          description: `Intervention ${type.name.toLowerCase()} pour ${item.type || 'déchet'}`,
          assignedTo: `Équipe ${Math.floor(Math.random() * 5) + 1}`,
          createdAt: item.date || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: status.id === 'completed' ? new Date().toISOString() : undefined,
          responseTime: responseTime,
          efficiency: efficiency
        })
      })

      setInterventions(interventions)
      calculateStats(interventions)
      setLoading(false)
    }

    generateInterventions()
  }, [collectes, depots])

  const calculateStats = (interventions: Intervention[]) => {
    const newStats: InterventionStats = {
      total: interventions.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      averageResponseTime: 0,
      averageEfficiency: 0,
      byType: {},
      byPriority: {}
    }

    let totalResponseTime = 0
    let totalEfficiency = 0
    let completedCount = 0

    interventions.forEach(intervention => {
      // Compter par statut
      if (intervention.status === 'pending') newStats.pending++
      else if (intervention.status === 'in_progress') newStats.inProgress++
      else if (intervention.status === 'completed') newStats.completed++
      else if (intervention.status === 'cancelled') newStats.cancelled++
      
      // Compter par type
      newStats.byType[intervention.type] = (newStats.byType[intervention.type] || 0) + 1
      
      // Compter par priorité
      newStats.byPriority[intervention.priority] = (newStats.byPriority[intervention.priority] || 0) + 1
      
      // Calculer les moyennes
      if (intervention.responseTime) {
        totalResponseTime += intervention.responseTime
        totalEfficiency += intervention.efficiency
        completedCount++
      }
    })

    newStats.averageResponseTime = completedCount > 0 ? Math.round(totalResponseTime / completedCount) : 0
    newStats.averageEfficiency = completedCount > 0 ? Math.round(totalEfficiency / completedCount) : 0

    setStats(newStats)
  }

  const filteredInterventions = interventions.filter(intervention => {
    const statusMatch = selectedStatus === 'all' || intervention.status === selectedStatus
    const typeMatch = selectedType === 'all' || intervention.type === selectedType
    const priorityMatch = selectedPriority === 'all' || intervention.priority === selectedPriority
    
    return statusMatch && typeMatch && priorityMatch
  })

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.id === status) || { color: 'gray', name: 'Inconnu', icon: '❓' }
  }

  const getTypeInfo = (type: string) => {
    return typeOptions.find(t => t.id === type) || { color: 'gray', name: 'Inconnu', icon: '📋' }
  }

  const getPriorityInfo = (priority: string) => {
    return priorityOptions.find(p => p.id === priority) || { color: 'gray', name: 'Inconnu', icon: '⚪' }
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? mins : ''}`
  }

  const getColorClasses = (color: string, variant: 'bg' | 'text' = 'bg') => {
    const colorMap: Record<string, Record<string, string>> = {
      green: { bg: 'bg-green-100', text: 'text-green-800' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
      red: { bg: 'bg-red-100', text: 'text-red-800' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-800' }
    }
    return colorMap[color]?.[variant] || colorMap.gray[variant]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
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
      <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Suivi des interventions</h2>
            <p className="text-gray-600">Historique et statut des interventions municipales ou citoyennes avec temps de réaction moyen</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="all">Tous les statuts</option>
              {statusOptions.map(status => (
                <option key={status.id} value={status.id}>
                  {status.icon} {status.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="all">Tous les types</option>
              {typeOptions.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="all">Toutes les priorités</option>
              {priorityOptions.map(priority => (
                <option key={priority.id} value={priority.id}>
                  {priority.icon} {priority.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total interventions</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Terminées</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">En cours</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">En attente</p>
                <p className="text-2xl font-bold text-red-900">{stats.pending}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Métriques de performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Temps de réaction moyen</h3>
            <p className="text-3xl font-bold text-blue-600">{formatResponseTime(stats.averageResponseTime)}</p>
            <p className="text-sm text-gray-500">Temps moyen de traitement</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Efficacité moyenne</h3>
            <p className="text-3xl font-bold text-green-600">{stats.averageEfficiency}%</p>
            <p className="text-sm text-gray-500">Score d'efficacité global</p>
          </div>
        </div>

        {/* Liste des interventions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Interventions récentes ({filteredInterventions.length})
          </h3>
          
          {filteredInterventions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune intervention trouvée avec les filtres sélectionnés.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInterventions.slice(0, 10).map((intervention) => {
                const statusInfo = getStatusInfo(intervention.status)
                const typeInfo = getTypeInfo(intervention.type)
                const priorityInfo = getPriorityInfo(intervention.priority)
                
                return (
                  <div key={intervention.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{typeInfo.icon}</div>
                      <div>
                        <p className="font-medium text-gray-900">{intervention.description}</p>
                        <p className="text-sm text-gray-500">{intervention.location}</p>
                        <p className="text-xs text-gray-400">
                          Assigné à: {intervention.assignedTo} • {new Date(intervention.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(statusInfo.color, 'bg')} ${getColorClasses(statusInfo.color, 'text')}`}>
                        {statusInfo.icon} {statusInfo.name}
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(priorityInfo.color, 'bg')} ${getColorClasses(priorityInfo.color, 'text')}`}>
                        {priorityInfo.icon} {priorityInfo.name}
                      </div>
                      {intervention.responseTime && (
                        <p className="text-xs text-gray-500">Réponse: {formatResponseTime(intervention.responseTime)}</p>
                      )}
                      <p className="text-xs text-gray-400">Efficacité: {intervention.efficiency}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}