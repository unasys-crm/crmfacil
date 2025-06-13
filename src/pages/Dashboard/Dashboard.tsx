import { 
  Users, 
  Building2, 
  Target, 
  DollarSign,
  Clock
} from 'lucide-react'
import { useEffect, useState } from 'react'
import StatsCard from './StatsCard'
import RecentActivity from './RecentActivity'
import SalesChart from './SalesChart'
import DealsOverview from './DealsOverview'
import { testSupabaseConnection, checkMigrations } from '../../utils/supabaseTest'

export default function Dashboard() {
  const [connectionTested, setConnectionTested] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'failed' | 'idle'>('idle')

  useEffect(() => {
    // Testar conexão com Supabase quando o dashboard carregar
    // Adicionar um delay para evitar problemas de timing
    const runTests = async () => {
      if (connectionTested) return // Evitar múltiplas execuções
      
      try {
        setConnectionStatus('testing')
        
        console.log('🚀 Iniciando testes de conectividade...')
        
        // Aguardar um pouco para garantir que tudo está carregado
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const connectionResult = await testSupabaseConnection()
        await checkMigrations()
        
        if (connectionResult.success) {
          console.log('✅ Ambiente Supabase configurado corretamente!')
          setConnectionStatus('success')
        } else {
          console.error('❌ Problemas na configuração do Supabase:', connectionResult.error)
          console.log('💡 O sistema pode ainda funcionar parcialmente. Use o botão de teste na tela de login para diagnósticos detalhados.')
          setConnectionStatus('failed')
        }
        
        setConnectionTested(true)
      } catch (error) {
        console.error('❌ Erro durante os testes de conectividade:', error)
        setConnectionStatus('failed')
        setConnectionTested(true)
      }
    }
    
    // Executar apenas uma vez
    const timeoutId = setTimeout(runTests, 1000)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [connectionTested])

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
      {/* Connection Status Banner */}
      {connectionStatus === 'failed' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Aviso de Conectividade:</strong> Não foi possível conectar com o banco de dados. 
                Alguns recursos podem não funcionar corretamente. 
                <a href="/login" className="underline ml-1">Teste a conexão aqui</a>.
              </p>
            </div>
          </div>
        </div>
      )}

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