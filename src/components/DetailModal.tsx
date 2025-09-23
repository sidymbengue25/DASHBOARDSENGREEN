import React from 'react'
import { formatDate } from '../lib/date'

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
  type: 'collecte' | 'depot' | 'historique' | 'users'
  users?: any[]
}

export const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, item, type, users = [] }) => {
  if (!isOpen || !item) return null

  // Fonction pour récupérer le nom d'un utilisateur
  const getUserName = (userId: string): string => {
    if (!userId) return 'Inconnu'
    const user = users.find(u => u.id === userId || u.uid === userId)
    return user ? (user.nom || user.name || user.displayName || 'Utilisateur') : userId.substring(0, 8) + '...'
  }

  const renderContent = () => {
    switch (type) {
      case 'collecte':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🗂️</span>
              <div>
                <h3 className="text-xl font-bold text-green-700">Collecte organisée</h3>
                <p className="text-sm text-gray-600">Détails de la collecte</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organisateur</label>
                  <p className="text-gray-900">{item.organisateur || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de collecte</label>
                  <p className="text-gray-900">{formatDate(item.dateCollecte)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heure</label>
                  <p className="text-gray-900">{item.heureCollecte || 'Non spécifiée'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    item.termine ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.termine ? 'Terminée' : 'En cours'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {item.creePar && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Créé par</label>
                    <p className="text-gray-900">{getUserName(item.creePar)}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="text-gray-900">{formatDate(item.heureSave)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <p className="text-gray-900 text-sm">
                    {item.position ? `${item.position._lat?.toFixed(6)}, ${item.position._long?.toFixed(6)}` : 'Non spécifiée'}
                  </p>
                </div>
              </div>
            </div>
            
            {item.commentaire && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p className="text-gray-900">{item.commentaire}</p>
                </div>
              </div>
            )}
          </div>
        )

      case 'depot':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🗑️</span>
              <div>
                <h3 className="text-xl font-bold text-red-700">Dépôt signalé</h3>
                <p className="text-sm text-gray-600">Détails du signalement</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type de déchet</label>
                  <p className="text-gray-900">{item.type_depot || 'Non spécifié'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de signalement</label>
                  <p className="text-gray-900">{formatDate(item.heure)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    item.ramasse ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.ramasse ? 'Ramassé' : 'En attente'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {item.userId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Signalé par</label>
                    <p className="text-gray-900">{getUserName(item.userId)}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <p className="text-gray-900 text-sm">
                    {item.position ? `${item.position._lat?.toFixed(6)}, ${item.position._long?.toFixed(6)}` : 'Non spécifiée'}
                  </p>
                </div>
              </div>
            </div>
            
            {item.image_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image du signalement</label>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <img 
                    src={item.image_url} 
                    alt="Dépôt signalé" 
                    className="max-w-full h-auto rounded border"
                  />
                </div>
              </div>
            )}
            
            {item.commentaire && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p className="text-gray-900">{item.commentaire}</p>
                </div>
              </div>
            )}
          </div>
        )

      case 'historique':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">📚</span>
              <div>
                <h3 className="text-xl font-bold text-blue-700">Historique de ramassage</h3>
                <p className="text-sm text-gray-600">Détails du traitement</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type de déchet</label>
                  <p className="text-gray-900">{item.type || 'Non spécifié'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de signalement</label>
                  <p className="text-gray-900">{formatDate(item.dateSignalement)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de ramassage</label>
                  <p className="text-gray-900">{formatDate(item.dateRamassage)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">État</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    item.etatDepot === 'ramasse' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.etatDepot === 'ramasse' ? 'Ramassé' : item.etatDepot}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {item.signalePar && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Signalé par</label>
                    <p className="text-gray-900">{getUserName(item.signalePar)}</p>
                  </div>
                )}
                {item.ramassePar && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ramassé par</label>
                    <p className="text-gray-900">{getUserName(item.ramassePar)}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <p className="text-gray-900 text-sm">
                    {item.position ? `${item.position._lat?.toFixed(6)}, ${item.position._long?.toFixed(6)}` : 'Non spécifiée'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Dépôt</label>
                  <p className="text-gray-900 text-sm">{item.depotId || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            
            {item.imageRamassage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image du signalement</label>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <img 
                    src={item.imageRamassage} 
                    alt="Dépôt ramassé" 
                    className="max-w-full h-auto rounded border"
                  />
                </div>
              </div>
            )}
            {item.commentaire && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p className="text-gray-900">{item.commentaire}</p>
                </div>
              </div>
            )}
          </div>
        )

      case 'users':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">👤</span>
              <div>
                <h3 className="text-xl font-bold text-purple-700">Utilisateur</h3>
                <p className="text-sm text-gray-600">Informations du compte</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-gray-900">{item.nom || item.name || item.displayName || 'Non spécifié'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{item.email || 'Non spécifié'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rôle</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    item.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.role || 'Utilisateur'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-gray-900 text-sm font-mono">{item.id || item.uid}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="text-gray-900">{formatDate(item.createdAt) || 'Non spécifiée'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dernière connexion</label>
                  <p className="text-gray-900">{formatDate(item.lastLogin) || 'Non spécifiée'}</p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Type non supporté</div>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Détails</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {renderContent()}
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
