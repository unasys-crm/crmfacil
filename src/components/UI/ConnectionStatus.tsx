import { AlertCircle, CheckCircle, Loader2, Wifi, WifiOff } from 'lucide-react'
import { useCompany } from '../../contexts/CompanyContext'

export default function ConnectionStatus() {
  const { connectionStatus, currentCompany } = useCompany()

  if (connectionStatus === 'unknown') {
    return null
  }

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          message: `Conectado ao banco de dados de ${currentCompany?.name || 'empresa'}`
        }
      case 'testing':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          message: 'Testando conexão com o banco de dados...'
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          message: 'Sem conexão com o banco de dados'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          message: 'Status da conexão desconhecido'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-md border ${config.bgColor} ${config.borderColor}`}>
      <Icon className={`h-4 w-4 ${config.color} ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.message}
      </span>
      {connectionStatus === 'disconnected' && (
        <a 
          href="/login" 
          className="text-xs underline text-red-700 hover:text-red-800"
        >
          Testar conexão
        </a>
      )}
    </div>
  )
}