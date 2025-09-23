import React, { useState } from 'react'
import { formatDate } from '../lib/date'
import { parsePosition } from '../lib/geo'

interface HistoriqueDepotsProps {
  historiqueDepots: any[]
  depots: any[]
}

export const HistoriqueDepots: React.FC<HistoriqueDepotsProps> = ({ historiqueDepots, depots }) => {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'dateSignalement' | 'dateRamassage'>('dateRamassage')

  const wasteTypes = [
    { id: 'Autre', name: 'Autre', icon: '📦' },
    { id: 'Plastique', name: 'Plastique', icon: '🔄' },
    { id: 'Papier', name: 'Papier', icon: '📄' },
    { id: 'Verre', name: 'Verre', icon: '🍷' },
    { id: 'Alimentaire', name: 'Alimentaire', icon: '🍎' },
    { id: 'Electronique', name: 'Électronique', icon: '📱' },
    { id: 'Divers', name: 'Divers', icon: '📋' }
  ]

  const statusOptions = [
    { id: 'ramasse', name: 'Ramassé', color: 'green', icon: '✅' },
    { id: 'en_cours', name: 'En cours', color: 'yellow', icon: '🔄' },
    { id: 'signale', name: 'Signalé', color: 'red', icon: '🚩' }
  ]

  // Combiner les données d'historique et de dépôts actuels
  const allDepots = [
    ...historiqueDepots.map(h => ({
      ...h,
      source: 'historique',
      dateSignalement: h.dateSignalement?.toDate?.() || h.dateSignalement,
      dateRamassage: h.dateRamassage?.toDate?.() || h.dateRamassage,
      status: h.etatDepot || 'ramasse'
    })),
    ...depots.map(d => ({
      ...d,
      source: 'actuel',
      dateSignalement: d.heure?.toDate?.() || d.heure,
      dateRamassage: d.ramasse ? d.heure?.toDate?.() || d.heure : null,
      status: d.ramasse ? 'ramasse' : 'signale',
      type: d.type_depot || d.type
    }))
  ]

  const filteredDepots = allDepots.filter(depot => {
    const typeMatch = selectedType === 'all' || depot.type === selectedType
    const statusMatch = selectedStatus === 'all' || depot.status === selectedStatus
    return typeMatch && statusMatch
  })

  const sortedDepots = filteredDepots.sort((a, b) => {
    const dateA = sortBy === 'dateRamassage' ? 
      (a.dateRamassage || a.dateSignalement) : a.dateSignalement
    const dateB = sortBy === 'dateRamassage' ? 
      (b.dateRamassage || b.dateSignalement) : b.dateSignalement
    
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1
    
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.id === status)
    return statusOption ? statusOption.color : 'gray'
  }

  const getTypeIcon = (type: string) => {
    const wasteType = wasteTypes.find(t => t.id === type)
    return wasteType ? wasteType.icon : '📦'
  }

  const calculateResponseTime = (signalement: Date, ramassage: Date) => {
    if (!signalement || !ramassage) return null
    const diff = new Date(ramassage).getTime() - new Date(signalement).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}j ${hours % 24}h`
    return `${hours}h`
  }

  const stats = {
    total: allDepots.length,
    ramasses: allDepots.filter(d => d.status === 'ramasse').length,
    enCours: allDepots.filter(d => d.status === 'en_cours').length,
    signales: allDepots.filter(d => d.status === 'signale').length,
    averageResponseTime: (() => {
      const ramasses = allDepots.filter(d => d.dateRamassage && d.dateSignalement)
      if (ramasses.length === 0) return 0
      
      const totalTime = ramasses.reduce((sum, depot) => {
        const diff = new Date(depot.dateRamassage).getTime() - new Date(depot.dateSignalement).getTime()
        return sum + diff
      }, 0)
      
      return Math.round(totalTime / ramasses.length / (1000 * 60 * 60)) // en heures
    })()
  }

  return (
    <div className="space-y-6">
      <div className="eco-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Historique des dépôts</h2>
            <p className="text-gray-600">Suivi complet des dépôts signalés et ramassés avec dates de traitement</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les types</option>
              {wasteTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
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
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dateSignalement' | 'dateRamassage')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="dateRamassage">Trier par ramassage</option>
              <option value="dateSignalement">Trier par signalement</option>
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total dépôts</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">📦</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Ramassés</p>
                <p className="text-2xl font-bold text-green-900">{stats.ramasses}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">En attente</p>
                <p className="text-2xl font-bold text-red-900">{stats.signales}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600">⏳</span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Temps moyen</p>
                <p className="text-2xl font-bold text-purple-900">{stats.averageResponseTime}h</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des dépôts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Historique détaillé ({filteredDepots.length} éléments)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedDepots.map((depot, index) => (
              <div key={`${depot.source}-${depot.id || depot.depotId || index}`} 
                   className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTypeIcon(depot.type)}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 capitalize">
                        {depot.type || 'Non spécifié'}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(depot.status)}-100 text-${getStatusColor(depot.status)}-800`}>
                        {statusOptions.find(s => s.id === depot.status)?.icon} {statusOptions.find(s => s.id === depot.status)?.name}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        depot.source === 'historique' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {depot.source === 'historique' ? '📚 Historique' : '📍 Actuel'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        <strong>Signalé:</strong> {formatDate(depot.dateSignalement)}
                      </p>
                      {depot.dateRamassage && (
                        <p>
                          <strong>Ramassé:</strong> {formatDate(depot.dateRamassage)}
                        </p>
                      )}
                      {depot.position && (
                        <p>
                          <strong>Position:</strong> {parsePosition(depot.position)?.[0]?.toFixed(4)}, {parsePosition(depot.position)?.[1]?.toFixed(4)}
                        </p>
                      )}
                      {depot.commentaire && (
                        <p className="text-xs italic">"{depot.commentaire}"</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {depot.dateRamassage && depot.dateSignalement && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {calculateResponseTime(depot.dateSignalement, depot.dateRamassage)}
                      </p>
                      <p className="text-xs text-gray-500">Temps de traitement</p>
                    </div>
                  )}
                  
                  {depot.ramassePar && (
                    <p className="text-xs text-green-600 mt-1">
                      Ramassé par: {depot.ramassePar.substring(0, 8)}...
                    </p>
                  )}
                  
                  {depot.signalePar && (
                    <p className="text-xs text-blue-600 mt-1">
                      Signalé par: {depot.signalePar.substring(0, 8)}...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
