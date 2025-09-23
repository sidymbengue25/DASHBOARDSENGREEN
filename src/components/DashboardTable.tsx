type Props = {
  title: string
  rows: any[]
  type: 'collecte' | 'users' | 'depot' | 'historique'
}

import { formatDate } from '../lib/date'
import { parsePosition } from '../lib/geo'

export function DashboardTable({ title, rows, type }: Props) {
  return (
    <section className="eco-card rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">
          {type === 'collecte' ? '🗑️' : type === 'users' ? '👥' : type === 'historique' ? '📚' : '⚠️'}
        </span>
        <h3 className="font-semibold text-lg text-green-700">{title}</h3>
      </div>
      <div className="overflow-x-auto rounded-lg border border-green-100">
                  <table className="min-w-full text-sm">
            <thead className="bg-green-50">
            <tr>
              {type === 'collecte' && (
                <>
                  <th className="px-3 py-2 text-left">Organisateur</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Heure</th>
                  <th className="px-3 py-2 text-left">Statut</th>
                  <th className="px-3 py-2 text-left">Commentaire</th>
                </>
              )}
              {type === 'users' && (
                <>
                  <th className="px-3 py-2 text-left">Prénom</th>
                  <th className="px-3 py-2 text-left">Nom</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Position</th>
                </>
              )}
              {type === 'depot' && (
                <>
                  <th className="px-3 py-2 text-left">Localisation</th>
                  <th className="px-3 py-2 text-left">État</th>
                  <th className="px-3 py-2 text-left">Date/Heure</th>
                </>
              )}
              {type === 'historique' && (
                <>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">État</th>
                  <th className="px-3 py-2 text-left">Date signalement</th>
                  <th className="px-3 py-2 text-left">Date ramassage</th>
                </>
              )}
            </tr>
          </thead>
                      <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-green-50/50 hover:bg-green-100/30 transition-colors">
                {type === 'collecte' && (
                  <>
                    <td className="px-3 py-2">{row.organisateur || 'N/A'}</td>
                    <td className="px-3 py-2">{formatDate(row.dateCollecte)}</td>
                    <td className="px-3 py-2">{row.heureCollecte || '-'}</td>
                    <td className="px-3 py-2">{row.termine ? 'Terminée' : 'En cours'}</td>
                    <td className="px-3 py-2">{row.commentaire || '-'}</td>
                  </>
                )}
                {type === 'users' && (
                  <>
                    <td className="px-3 py-2">{row.firstname || 'N/A'}</td>
                    <td className="px-3 py-2">{row.lastname || 'N/A'}</td>
                    <td className="px-3 py-2">{row.email || 'N/A'}</td>
                    <td className="px-3 py-2">
                      {Array.isArray(row.position) && row.position.length === 2
                        ? `${row.position[0]}, ${row.position[1]}`
                        : '-'}
                    </td>
                  </>
                )}
                {type === 'depot' && (() => {
                  const parsed = parsePosition(row.position || row.location)
                  const coords = parsed ? `${parsed[0]}, ${parsed[1]}` : '-'
                  const etat = (row.etat || row.type_depot || (row.ramasse === true ? 'Ramassé' : row.ramasse === false ? 'En attente' : null)) ?? 'N/A'
                  const dateVal = row.date || row.heure || row.createdAt
                  return (
                    <>
                      <td className="px-3 py-2">{coords}</td>
                      <td className="px-3 py-2">{etat}</td>
                      <td className="px-3 py-2">{formatDate(dateVal)}</td>
                    </>
                  )
                })()}
                {type === 'historique' && (
                  <>
                    <td className="px-3 py-2">{row.type || 'N/A'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.etatDepot === 'ramasse' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.etatDepot === 'ramasse' ? '✅ Ramassé' : '⏳ En cours'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatDate(row.dateSignalement)}</td>
                    <td className="px-3 py-2">{row.dateRamassage ? formatDate(row.dateRamassage) : '-'}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}


