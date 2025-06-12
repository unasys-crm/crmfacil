import React from 'react'
import { 
  Users, 
  Building2, 
  Target, 
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Clock
} from 'lucide-react'
import StatsCard from './StatsCard'
import RecentActivity from './RecentActivity'
import SalesChart from './SalesChart'
import DealsOverview from './DealsOverview'

export default function Dashboard() {
  const stats = [
    {
      name: 'Total de Clientes',
      value: '2,847',
      change: '+12%',
      changeType: 'increase' as const,
      icon: Users,
    },
    {
      name: 'Empresas Ativas',
      value: '1,234',
      change: '+8%',
      changeType: 'increase' as const,
      icon: Building2,
    },
    {
      name: 'Negócios Abertos',
      value: '156',
      change: '-3%',
      changeType: 'decrease' as const,
      icon: Target,
    },
    {
      name: 'Receita do Mês',
      value: 'R$ 847.500',
      change: '+23%',
      changeType: 'increase' as const,
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu CRM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <DealsOverview />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Próximos Compromissos
          </h3>
          <div className="space-y-4">
            {[
              {
                title: 'Reunião com Cliente ABC',
                time: '14:00',
                date: 'Hoje',
                type: 'meeting',
              },
              {
                title: 'Follow-up Proposta XYZ',
                time: '10:30',
                date: 'Amanhã',
                type: 'call',
              },
              {
                title: 'Apresentação Produto',
                time: '16:00',
                date: 'Sex, 15/12',
                type: 'presentation',
              },
            ].map((event, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {event.date} às {event.time}
                  </p>
                </div>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}