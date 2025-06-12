import React from 'react'

export default function Administration() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
        <p className="text-gray-600">Configurações e administração do sistema</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Módulo em Desenvolvimento
          </h3>
          <p className="text-gray-600">
            As configurações de usuários, workflows e integrações estarão disponíveis em breve.
          </p>
        </div>
      </div>
    </div>
  )
}