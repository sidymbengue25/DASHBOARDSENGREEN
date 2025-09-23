import React, { useState, useEffect } from 'react'

interface Alert {
  id: string
  type: 'hotspot' | 'anomaly' | 'overflow' | 'illegal_dumping' | 'equipment_failure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved' | 'false_positive'
  title: string
  description: string
  location: string
  coordinates: [number, number]
  detectedAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  confidence: number
  affectedArea: number // en m²
  estimatedImpact: string
  recommendedActions: string[]
  assignedTo?: string
}

interface AlertStats {
  total: number
  active: number
  acknowledged: number
  resolved: number
  false_positive: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  averageResponseTime: number
  falsePositiveRate: number
}

interface SmartAlertsProps {
  collectes: any[]
  depots: any[]
}

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ collectes, depots }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    active: 0,
    acknowledged: 0,
    resolved: 0,
    false_positive: 0,
    byType: {},
    bySeverity: {},
    averageResponseTime: 0,
    falsePositiveRate: 0
  })

  const alertTypes = [
    { id: 'hotspot', name: 'Point chaud', color: 'red', icon: '🔥', description: 'Accumulation anormale de déchets' },
    { id: 'anomaly', name: 'Anomalie', color: 'orange', icon: '⚠️', description: 'Comportement anormal détecté' },
    { id: 'overflow', name: 'Débordement', color: 'yellow', icon: '📦', description: 'Conteneur plein ou débordant' },
    { id: 'illegal_dumping', name: 'Dépôt illégal', color: 'purple', icon: '🚫', description: 'Dépôt non autorisé détecté' },
    { id: 'equipment_failure', name: 'Panne équipement', color: 'blue', icon: '🔧', description: 'Dysfonctionnement d\'équipement' }
  ]

  const severityLevels = [
    { id: 'low', name: 'Faible', color: 'green', icon: '🟢' },
    { id: 'medium', name: 'Moyenne', color: 'yellow', icon: '🟡' },
    { id: 'high', name: 'Élevée', color: 'orange', icon: '🟠' },
    { id: 'critical', name: 'Critique', color: 'red', icon: '🔴' }
  ]

  const statusOptions = [
    { id: 'active', name: 'Active', color: 'red', icon: '🔴' },
    { id: 'acknowledged', name: 'Reconnue', color: 'yellow', icon: '🟡' },
    { id: 'resolved', name: 'Résolue', color: 'green', icon: '🟢' },
    { id: 'false_positive', name: 'Faux positif', color: 'gray', icon: '⚪' }
  ]

  // Simuler la génération d'alertes intelligentes
  useEffect(() => {
    const generateAlerts = () => {
      const alerts: Alert[] = []
      
      // Générer des alertes basées sur les collectes et dépôts
      const allItems = [...collectes, ...depots]
      allItems.forEach((item, index) => {
        if (Math.random() > 0.7) { // 30% de chance d'avoir une alerte
          const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]
          const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)]
          const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]
          const confidence = Math.floor(Math.random() * 40) + 60 // 60-100%
          
          alerts.push({
            id: `alert-${index}`,
            type: type.id as any,
            severity: severity.id as any,
            status: status.id as any,
            title: `${type.name} détecté`,
            description: `${type.description} à ${item.adresse || 'cette localisation'}`,
            location: item.adresse || `Point ${index + 1}`,
            coordinates: [item.latitude || 0, item.longitude || 0],
            detectedAt: item.date || new Date().toISOString(),
            acknowledgedAt: status.id === 'acknowledged' || status.id === 'resolved' ? new Date().toISOString() : undefined,
            resolvedAt: status.id === 'resolved' ? new Date().toISOString() : undefined,
            confidence: confidence,
            affectedArea: Math.floor(Math.random() * 1000) + 100,
            estimatedImpact: ['Faible', 'Modéré', 'Important', 'Critique'][Math.floor(Math.random() * 4)],
            recommendedActions: [
              'Vérifier la zone',
              'Envoyer une équipe',
              'Nettoyer immédiatement',
              'Installer des barrières'
            ].slice(0, Math.floor(Math.random() * 3) + 1),
            assignedTo: status.id === 'acknowledged' || status.id === 'resolved' ? `Équipe ${Math.floor(Math.random() * 5) + 1}` : undefined
          })
        }
      })

      setAlerts(alerts)
      calculateStats(alerts)
      setLoading(false)
    }

    generateAlerts()
  }, [collectes, depots])

  const calculateStats = (alerts: Alert[]) => {
    const stats: AlertStats = {
      total: alerts.length,
      active: 0,
      acknowledged: 0,
      resolved: 0,
      false_positive: 0,
      byType: {},
      bySeverity: {},
      averageResponseTime: 0,
      falsePositiveRate: 0
    }

    let totalResponseTime = 0
    let resolvedCount = 0
    let falsePositiveCount = 0

    alerts.forEach(alert => {
      // Compter par statut
      stats[alert.status]++
      
      // Compter par type
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1
      
      // Compter par sévérité
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1
      
      // Calculer le temps de réponse
      if (alert.acknowledgedAt && alert.detectedAt) {
        const responseTime = new Date(alert.acknowledgedAt).getTime() - new Date(alert.detectedAt).getTime()
        totalResponseTime += responseTime
        resolvedCount++
      }
      
      // Compter les faux positifs
      if (alert.status === 'false_positive') {
        falsePositiveCount++
      }
    })

    stats.averageResponseTime = resolvedCount > 0 ? Math.round(totalResponseTime / resolvedCount / (1000 * 60)) : 0 // en minutes
    stats.falsePositiveRate = stats.total > 0 ? Math.round((falsePositiveCount / stats.total) * 100) : 0

    setStats(stats)
  }

  const filteredAlerts = alerts.filter(alert => {
    const typeMatch = selectedType === 'all' || alert.type === selectedType
    const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity
    const statusMatch = selectedStatus === 'all' || alert.status === selectedStatus
    
    return typeMatch && severityMatch && statusMatch
  })

  const getTypeIcon = (type: string) => {
    const alertType = alertTypes.find(t => t.id === type)
    return alertType ? alertType.icon : '📋'
  }

  const getSeverityColor = (severity: string) => {
    const severityLevel = severityLevels.find(s => s.id === severity)
    return severityLevel ? severityLevel.color : 'gray'
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.id === status)
    return statusOption ? statusOption.color : 'gray'
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alertes intelligentes</h2>
            <p className="text-gray-600">Détection automatique de points chauds ou de situations anormales avec notifications</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les types</option>
              {alertTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Toutes les sévérités</option>
              {severityLevels.map(severity => (
                <option key={severity.id} value={severity.id}>
                  {severity.icon} {severity.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les statuts</option>
              {statusOptions.map(status => (
                <option key={status.id} value={status.id}>
                  {status.icon} {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Alertes actives</p>
                <p className="text-2xl font-bold text-red-900">{stats.active}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Résolues</p>
                <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Temps de réponse</p>
                <p className="text-2xl font-bold text-blue-900">{stats.averageResponseTime}min</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faux positifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.falsePositiveRate}%</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.57M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Répartition par type */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type d'alerte</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {alertTypes.map(type => {
              const count = stats.byType[type.id] || 0
              const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : '0'
              
              return (
                <div key={type.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-sm font-medium text-gray-500">{percentage}%</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{type.name}</p>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Liste des alertes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes récentes</h3>
          <div className="space-y-3">
            {filteredAlerts.slice(0, 10).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTypeIcon(alert.type)}</div>
                  <div>
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-500">{alert.location}</p>
                    <p className="text-xs text-gray-400">
                      Détecté: {formatTime(alert.detectedAt)} • Confiance: {alert.confidence}%
                    </p>
                    {alert.assignedTo && (
                      <p className="text-xs text-blue-600">Assigné à: {alert.assignedTo}</p>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getSeverityColor(alert.severity)}-100 text-${getSeverityColor(alert.severity)}-800`}>
                    {severityLevels.find(s => s.id === alert.severity)?.icon} {severityLevels.find(s => s.id === alert.severity)?.name}
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(alert.status)}-100 text-${getStatusColor(alert.status)}-800`}>
                    {statusOptions.find(s => s.id === alert.status)?.icon} {statusOptions.find(s => s.id === alert.status)?.name}
                  </div>
                  <p className="text-xs text-gray-500">Zone: {alert.affectedArea}m²</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
