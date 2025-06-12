import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react''lucide-react'
import { cn } from '../../lib/utils'

interface StatsCardProps {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: LucideIcon
}

export default function StatsCard({ name, value, change, changeType, icon: Icon }: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-primary-600" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {name}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              <div className={cn(
                'ml-2 flex items-baseline text-sm font-semibold',
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              )}>
                {changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4 flex-shrink-0 self-center" />
                ) : (
                  <TrendingDown className="h-4 w-4 flex-shrink-0 self-center" />
                )}
                <span className="ml-1">{change}</span>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}