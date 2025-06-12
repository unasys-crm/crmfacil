import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Target,
  FileText,
  BarChart3,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Empresas', href: '/companies', icon: Building2 },
  { name: 'Agenda', href: '/calendar', icon: Calendar },
  { name: 'Negócios', href: '/deals', icon: Target },
  { name: 'Propostas', href: '/proposals', icon: FileText },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Administração', href: '/administration', icon: Settings },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CRM</span>
          </div>
          <span className="ml-3 text-xl font-semibold text-gray-900">
            CRM Fácil
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-primary-600" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}