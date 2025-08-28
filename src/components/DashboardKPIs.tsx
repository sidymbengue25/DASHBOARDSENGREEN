type Props = {
  totalCollectes: number
  totalCollectesTerminees: number
  totalDepots: number
  totalUsers: number
  loading?: boolean
}

export function DashboardKPIs({ totalCollectes, totalCollectesTerminees, totalDepots, totalUsers, loading }: Props) {
  const items = [
    { 
      label: 'Collectes organisées', 
      value: totalCollectes,
      icon: '🗑️',
      className: 'kpi-card'
    },
    { 
      label: 'Collectes terminées', 
      value: totalCollectesTerminees,
      icon: '✅',
      className: 'kpi-card-secondary'
    },
    { 
      label: 'Dépôts signalés', 
      value: totalDepots,
      icon: '⚠️',
      className: 'kpi-card-warning'
    },
    { 
      label: 'Utilisateurs', 
      value: totalUsers,
      icon: '👥',
      className: 'kpi-card-info'
    },
  ]

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((kpi) => (
        <div key={kpi.label} className={`${kpi.className} rounded-xl p-6 transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">{kpi.label}</p>
              <p className="text-3xl font-bold mt-2">{loading ? '...' : kpi.value}</p>
            </div>
            <div className="text-4xl opacity-80">
              {kpi.icon}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}


