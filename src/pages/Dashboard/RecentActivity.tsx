import { 
  User, 
  Building2, 
  Target, 
  FileText, 
  Calendar,
  Phone,
  Mail
} from 'lucide-react'
import { formatDateTime } from '../../lib/utils'

const activities = [
  {
    id: 1,
    type: 'client_created',
    title: 'Novo cliente cadastrado',
    description: 'João Silva foi adicionado ao sistema',
    icon: User,
    time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    color: 'bg-green-500',
  },
  {
    id: 2,
    type: 'deal_moved',
    title: 'Negócio movido',
    description: 'Proposta ABC movida para "Negociação"',
    icon: Target,
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    color: 'bg-blue-500',
  },
  {
    id: 3,
    type: 'proposal_sent',
    title: 'Proposta enviada',
    description: 'Proposta #1234 enviada para Empresa XYZ',
    icon: FileText,
    time: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    color: 'bg-purple-500',
  },
  {
    id: 4,
    type: 'meeting_scheduled',
    title: 'Reunião agendada',
    description: 'Reunião com cliente para amanhã às 14h',
    icon: Calendar,
    time: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    color: 'bg-orange-500',
  },
  {
    id: 5,
    type: 'call_made',
    title: 'Ligação realizada',
    description: 'Contato telefônico com lead Maria Santos',
    icon: Phone,
    time: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    color: 'bg-indigo-500',
  },
]

export default function RecentActivity() {
  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Atividades Recentes
      </h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`${activity.color} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}>
                      <activity.icon className="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      {formatDateTime(activity.time)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}