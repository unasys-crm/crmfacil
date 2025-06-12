export default function Calendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-600">Gerencie seus compromissos e eventos</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Módulo em Desenvolvimento
          </h3>
          <p className="text-gray-600">
            A agenda integrada com Google Calendar e Outlook estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  )
}