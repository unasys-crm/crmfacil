import { useState } from 'react'
import { 
  Users, 
  Shield, 
  Workflow, 
  FormInput, 
  Zap, 
  Link,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react'

export default function Administration() {
  const [activeTab, setActiveTab] = useState('users')

  const tabs = [
    { id: 'users', name: 'Usuários', icon: Users },
    { id: 'profiles', name: 'Perfis', icon: Shield },
    { id: 'workflows', name: 'Workflows', icon: Workflow },
    { id: 'fields', name: 'Campos e Formulários', icon: FormInput },
    { id: 'automation', name: 'Automação', icon: Zap },
    { id: 'integrations', name: 'Integrações', icon: Link },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
        <p className="text-gray-600">Configure e gerencie o sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'profiles' && <ProfilesTab />}
        {activeTab === 'workflows' && <WorkflowsTab />}
        {activeTab === 'fields' && <FieldsTab />}
        {activeTab === 'automation' && <AutomationTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
      </div>
    </div>
  )
}

function UsersTab() {
  const [users] = useState([
    {
      id: '1',
      name: 'Admin Sistema',
      email: 'admin@crmfacil.com',
      role: 'Administrador',
      team: 'Gestão',
      status: 'Ativo',
      lastLogin: '2024-01-15 14:30',
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@crmfacil.com',
      role: 'Vendedor',
      team: 'Vendas',
      status: 'Ativo',
      lastLogin: '2024-01-15 09:15',
    },
  ])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Usuários do Sistema</h3>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perfil
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Acesso
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.team}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-primary-600 hover:text-primary-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProfilesTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Perfis de Usuário</h3>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Perfil
        </button>
      </div>
      <p className="text-gray-600">Configure perfis e permissões de acesso aos módulos do sistema.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Administrador', 'Vendedor', 'Gerente'].map((profile) => (
          <div key={profile} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">{profile}</h4>
            <p className="text-sm text-gray-500 mt-1">
              Configurações de acesso para {profile.toLowerCase()}
            </p>
            <div className="mt-4 flex space-x-2">
              <button className="btn-secondary text-xs">
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkflowsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Workflows Automáticos</h3>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Workflow
        </button>
      </div>
      <p className="text-gray-600">
        Configure ações automáticas baseadas em gatilhos usando a lógica "Se isso, então aquilo".
      </p>
      
      <div className="space-y-3">
        {[
          'Quando negócio for movido para "Proposta" → Enviar email automático',
          'Quando cliente for cadastrado → Criar tarefa de follow-up',
          'Quando proposta for aceita → Mover negócio para "Fechamento"'
        ].map((workflow, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{workflow}</p>
              <p className="text-xs text-gray-500">Ativo</p>
            </div>
            <div className="flex space-x-2">
              <button className="text-primary-600 hover:text-primary-900">
                <Edit className="h-4 w-4" />
              </button>
              <button className="text-red-600 hover:text-red-900">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FieldsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Campos e Formulários</h3>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Campo
        </button>
      </div>
      <p className="text-gray-600">
        Configure campos personalizados para clientes, empresas e negócios.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900">Campos de Cliente</h4>
          <p className="text-sm text-gray-500 mt-1">3 campos personalizados</p>
          <button className="mt-2 btn-secondary text-xs">Gerenciar</button>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900">Campos de Empresa</h4>
          <p className="text-sm text-gray-500 mt-1">5 campos personalizados</p>
          <button className="mt-2 btn-secondary text-xs">Gerenciar</button>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900">Campos de Negócio</h4>
          <p className="text-sm text-gray-500 mt-1">2 campos personalizados</p>
          <button className="mt-2 btn-secondary text-xs">Gerenciar</button>
        </div>
      </div>
    </div>
  )
}

function AutomationTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Automação de Marketing</h3>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </button>
      </div>
      <p className="text-gray-600">
        Configure disparos automáticos de email e WhatsApp baseados em gatilhos.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900">Email Marketing</h4>
          <p className="text-sm text-gray-500 mt-1">Campanhas automáticas por email</p>
          <button className="mt-2 btn-secondary text-xs">Configurar</button>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900">WhatsApp</h4>
          <p className="text-sm text-gray-500 mt-1">Mensagens automáticas via WhatsApp</p>
          <button className="mt-2 btn-secondary text-xs">Configurar</button>
        </div>
      </div>
    </div>
  )
}

function IntegrationsTab() {
  const integrations = [
    { name: 'Zenvia', description: 'Envio de SMS e WhatsApp', status: 'Disponível' },
    { name: 'Asaas', description: 'Gateway de pagamento', status: 'Disponível' },
    { name: 'Facebook', description: 'Leads do Facebook', status: 'Disponível' },
    { name: 'Power BI', description: 'Relatórios avançados', status: 'Disponível' },
    { name: 'Google Calendar', description: 'Sincronização de agenda', status: 'Ativo' },
    { name: 'Outlook', description: 'Sincronização de agenda', status: 'Ativo' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Integrações</h3>
      <p className="text-gray-600">
        Ative e configure integrações com serviços externos.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <div key={integration.name} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{integration.name}</h4>
              <p className="text-sm text-gray-500">{integration.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                integration.status === 'Ativo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {integration.status}
              </span>
              <button className="btn-secondary text-xs">
                {integration.status === 'Ativo' ? 'Configurar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}