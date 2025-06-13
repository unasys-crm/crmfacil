import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CompanyProvider } from './contexts/CompanyContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Clients from './pages/Clients/Clients'
import ClientForm from './pages/Clients/ClientForm'
import Companies from './pages/Companies/Companies'
import CompanyForm from './pages/Companies/CompanyForm'
import Calendar from './pages/Calendar/Calendar'
import Deals from './pages/Deals/Deals'
import Proposals from './pages/Proposals/Proposals'
import Reports from './pages/Reports/Reports'
import Administration from './pages/Administration/Administration'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import ErrorBoundary from './components/UI/ErrorBoundary'

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <CompanyProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/new" element={<ClientForm />} />
                <Route path="clients/:id/edit" element={<ClientForm />} />
                <Route path="companies" element={<Companies />} />
                <Route path="companies/new" element={<CompanyForm />} />
                <Route path="companies/:id/edit" element={<CompanyForm />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="deals" element={<Deals />} />
                <Route path="proposals" element={<Proposals />} />
                <Route path="reports" element={<Reports />} />
                <Route path="administration" element={<Administration />} />
              </Route>
            </Routes>
          </CompanyProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  )
}

export default App