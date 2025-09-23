import { useEffect, useState } from 'react'
import { DashboardKPIs } from './components/DashboardKPIs'
import { DashboardCharts } from './components/DashboardCharts'
import { DashboardMap } from './components/DashboardMap'
import { DashboardTable } from './components/DashboardTable'
import { DashboardHeader } from './components/DashboardHeader'
import { Sidebar } from './components/Sidebar'
import { DensityAnalysis } from './components/DensityAnalysis'
import { WasteTypology } from './components/WasteTypology'
import { InterventionsTracking } from './components/InterventionsTracking'
import { SmartAlerts } from './components/SmartAlerts'
import { ForecastingModule } from './components/ForecastingModule'
import { AdvancedGISModule } from './components/AdvancedGISModule'
import { DensityMap } from './components/DensityMap'
// import { HistoriqueDepots } from './components/HistoriqueDepots'
import Demographics from './components/Demographics'
import { ComparisonModule } from './components/ComparisonModule'
import { SatelliteModule } from './components/SatelliteModule'
// import { TestComponent } from './components/TestComponent'
import { getCollectes, getUsers, getDepots, getHistoriqueDepots, getMobilier, getNotifications } from './services/firestoreService'

export type Position = [number, number]

export default function App() {
  const [collectes, setCollectes] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [depots, setDepots] = useState<any[]>([])
  const [historiqueDepots, setHistoriqueDepots] = useState<any[]>([])
  const [mobilier, setMobilier] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    async function load() {
      try {
        const [c, u, d, h, m, n] = await Promise.all([
          getCollectes(),
          getUsers(),
          getDepots(),
          getHistoriqueDepots(),
          getMobilier(),
          getNotifications(),
        ])
        setCollectes(c)
        setUsers(u)
        setDepots(d)
        setHistoriqueDepots(h)
        setMobilier(m)
        setNotifications(n)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardKPIs
              totalCollectes={collectes.length}
              totalCollectesTerminees={collectes.filter(c => c.termine).length}
              totalDepots={depots.length + historiqueDepots.length}
              totalUsers={users.length}
              loading={loading}
            />
            <DashboardCharts collectes={collectes} depots={[...depots, ...historiqueDepots]} />
            <DashboardMap collectes={collectes} depots={[...depots, ...historiqueDepots]} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardTable title="Collectes organisées" rows={collectes} type="collecte" users={users} />
              <DashboardTable title="Utilisateurs" rows={users} type="users" users={users} />
              <DashboardTable title="Dépôts signalés" rows={depots} type="depot" users={users} />
              <DashboardTable title="Historique dépôts" rows={historiqueDepots} type="historique" users={users} />
            </div>
          </div>
        )
      case 'map':
        return <AdvancedGISModule collectes={collectes} depots={depots} historiqueDepots={historiqueDepots} users={users} />
      case 'density':
        return (
          <div className="space-y-6">
            <DensityAnalysis collectes={collectes} depots={depots} />
            <DensityMap collectes={collectes} depots={depots} />
          </div>
        )
      case 'typology':
        return <WasteTypology collectes={collectes} depots={depots} />
      case 'interventions':
        return <InterventionsTracking collectes={collectes} depots={depots} />
      case 'demographics':
        return <Demographics collectes={collectes} depots={depots} />
      case 'alerts':
        return <SmartAlerts collectes={collectes} depots={depots} />
      case 'forecasting':
        return <ForecastingModule collectes={collectes} depots={depots} />
      case 'comparison':
        return <ComparisonModule collectes={collectes} depots={depots} historiqueDepots={historiqueDepots} />
      case 'satellite':
        return <SatelliteModule collectes={collectes} depots={depots} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
