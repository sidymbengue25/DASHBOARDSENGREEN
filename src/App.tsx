import { useEffect, useState } from 'react'
import { DashboardKPIs } from './components/DashboardKPIs'
import { DashboardCharts } from './components/DashboardCharts'
import { DashboardMap } from './components/DashboardMap'
import { DashboardTable } from './components/DashboardTable'
import { getCollectes, getUsers, getDepots } from './services/firestoreService'

export type Position = [number, number]

export default function App() {
  const [collectes, setCollectes] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [depots, setDepots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [c, u, d] = await Promise.all([
          getCollectes(),
          getUsers(),
          getDepots(),
        ])
        setCollectes(c)
        setUsers(u)
        setDepots(d)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex items-center justify-between eco-card rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 eco-gradient rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              SENGREEN Dashboard
            </h1>
            <p className="text-green-600 font-medium">Gestion intelligente des déchets</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-green-600">Temps réel</p>
          <p className="text-xs text-gray-500">Mis à jour automatiquement</p>
        </div>
      </header>

      <DashboardKPIs
        totalCollectes={collectes.length}
        totalCollectesTerminees={collectes.filter(c => c.termine).length}
        totalDepots={depots.length}
        totalUsers={users.length}
        loading={loading}
      />

      <DashboardCharts collectes={collectes} depots={depots} />

      <DashboardMap collectes={collectes} depots={depots} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardTable title="Collectes organisées" rows={collectes} type="collecte" />
        <DashboardTable title="Utilisateurs" rows={users} type="users" />
        <DashboardTable title="Dépôts signalés" rows={depots} type="depot" />
      </div>
    </div>
  )
}


