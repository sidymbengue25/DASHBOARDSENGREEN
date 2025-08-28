import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { toDate } from '../lib/date'

type Props = {
  collectes: any[]
  depots: any[]
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

function groupByMonth(items: any[], dateKey: string) {
  const map = new Map<string, number>()
  items.forEach((it) => {
    const date = toDate(it[dateKey] ?? it.date ?? it.createdAt) || new Date()
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    map.set(key, (map.get(key) || 0) + 1)
  })
  return Array.from(map.entries()).map(([month, count]) => ({ month, count }))
}

export function DashboardCharts({ collectes, depots }: Props) {
  const serie = groupByMonth(collectes, 'dateCollecte')
  const repartitionOrganisateur = Object.entries(
    collectes.reduce((acc: Record<string, number>, c: any) => {
      const org = c.organisateur || 'Inconnu'
      acc[org] = (acc[org] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="eco-card rounded-xl p-6 h-80">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">📈</span>
          <h3 className="font-semibold text-lg text-green-700">Évolution des collectes par mois</h3>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={serie}>
            <XAxis dataKey="month" stroke="#059669" />
            <YAxis allowDecimals={false} stroke="#059669" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                border: '1px solid #10b981',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="eco-card rounded-xl p-6 h-80">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">🥧</span>
          <h3 className="font-semibold text-lg text-green-700">Répartition des collectes par organisateur</h3>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={repartitionOrganisateur} 
              dataKey="value" 
              nameKey="name" 
              outerRadius={100}
              innerRadius={40}
            >
              {repartitionOrganisateur.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                border: '1px solid #10b981',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}


