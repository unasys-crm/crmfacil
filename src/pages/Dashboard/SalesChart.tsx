import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', vendas: 65000, meta: 70000 },
  { name: 'Fev', vendas: 78000, meta: 75000 },
  { name: 'Mar', vendas: 82000, meta: 80000 },
  { name: 'Abr', vendas: 95000, meta: 85000 },
  { name: 'Mai', vendas: 88000, meta: 90000 },
  { name: 'Jun', vendas: 102000, meta: 95000 },
  { name: 'Jul', vendas: 115000, meta: 100000 },
  { name: 'Ago', vendas: 108000, meta: 105000 },
  { name: 'Set', vendas: 125000, meta: 110000 },
  { name: 'Out', vendas: 132000, meta: 115000 },
  { name: 'Nov', vendas: 145000, meta: 120000 },
  { name: 'Dez', vendas: 158000, meta: 125000 },
]

export default function SalesChart() {
  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Vendas vs Meta (2024)
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => 
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                }).format(value)
              }
            />
            <Tooltip 
              formatter={(value: number) => [
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(value),
                value === data[0]?.vendas ? 'Vendas' : 'Meta'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="vendas" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="meta" 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}