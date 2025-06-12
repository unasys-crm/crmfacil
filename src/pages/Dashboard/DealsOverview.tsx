import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Prospecção', value: 35, color: '#ef4444' },
  { name: 'Qualificação', value: 28, color: '#f97316' },
  { name: 'Proposta', value: 22, color: '#eab308' },
  { name: 'Negociação', value: 18, color: '#22c55e' },
  { name: 'Fechamento', value: 12, color: '#3b82f6' },
]

export default function DealsOverview() {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Funil de Vendas
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} negócios`, 'Quantidade']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}