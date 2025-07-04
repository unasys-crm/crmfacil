import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { testSupabaseConnection } from '../../utils/supabaseTest'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [creatingDemo, setCreatingDemo] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleTestConnection = async () => {
    console.log('🔧 Testando conexão manual...')
    setError('')
    setSuccess('')
    
    const result = await testSupabaseConnection()
    
    if (result.success) {
      setSuccess(`✅ Conexão com Supabase funcionando corretamente!\n🌐 URL: ${result.url}\n👤 Sessão: ${result.hasSession ? 'Ativo' : 'Nenhum usuário logado'}`)
    } else {
      setError(`❌ Erro na conexão com Supabase:\n\n${result.error}`)
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      // Provide more specific error messages
      if (err.message?.includes('Invalid login credentials')) {
        if (email === 'admin@crmfacil.com') {
          setError('Usuário demo não encontrado. Clique em "Criar Usuário Demo" para criá-lo automaticamente.')
        } else {
          setError('Email ou senha incorretos. Verifique suas credenciais e tente novamente.')
        }
      } else if (err.message?.includes('Email not confirmed') || err.message?.includes('email_not_confirmed')) {
        if (email === 'admin@crmfacil.com') {
          setError('Para usar o usuário demo, você precisa desabilitar a confirmação de email no Supabase. Vá em Authentication > Settings > Email Confirmation e desmarque "Enable email confirmations".')
        } else {
          setError('Email não confirmado. Verifique sua caixa de entrada ou desabilite a confirmação de email nas configurações do Supabase.')
        }
      } else if (err.message?.includes('Too many requests')) {
        setError('Muitas tentativas de login. Tente novamente em alguns minutos.')
      } else {
        setError(err.message || 'Erro ao fazer login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('admin@crmfacil.com')
    setPassword('123456')
  }

  const handleCreateDemoUser = async () => {
    setCreatingDemo(true)
    setError('')
    setSuccess('')

    try {
      const user = await signUp('admin@crmfacil.com', '123456')
      
      // Create user profile in public.users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: 'Admin Demo',
          role: 'admin',
          tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' // Demo tenant ID
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't throw here as the auth user was created successfully
      }

      setSuccess('Usuário demo criado com sucesso! Agora você pode fazer login.')
      setEmail('admin@crmfacil.com')
      setPassword('123456')
    } catch (err: any) {
      if (err.message?.includes('User already registered')) {
        // Check if user profile exists in public.users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', 'admin@crmfacil.com')
          .single()

        if (!existingUser) {
          // User exists in auth but not in public.users, try to get the auth user
          const { data: authData } = await supabase.auth.signInWithPassword({
            email: 'admin@crmfacil.com',
            password: '123456'
          })

          if (authData.user) {
            // Create the missing profile
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email: authData.user.email,
                name: 'Admin Demo',
                role: 'admin',
                tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
              })

            if (profileError) {
              console.error('Error creating missing user profile:', profileError)
            }

            // Sign out after creating profile
            await supabase.auth.signOut()
          }
        }

        setSuccess('Usuário demo já existe! Você pode fazer login normalmente.')
        setEmail('admin@crmfacil.com')
        setPassword('123456')
      } else {
        setError(err.message || 'Erro ao criar usuário demo')
      }
    } finally {
      setCreatingDemo(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">CRM</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestão de Relacionamento
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
              <div className="h-5 w-5 text-green-400 mr-2 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="form-input pr-10"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800 font-medium mb-3">
                Credenciais de demonstração:
              </p>
              <p className="text-sm text-blue-700">
                Email: <strong>admin@crmfacil.com</strong>
              </p>
              <p className="text-sm text-blue-700 mb-3">
                Senha: <strong>123456</strong>
              </p>
              
              <div className="flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded transition-colors"
                >
                  Preencher automaticamente
                </button>
                
                <button
                  type="button"
                  onClick={handleCreateDemoUser}
                  disabled={creatingDemo}
                  className="flex items-center justify-center text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded transition-colors disabled:opacity-50"
                >
                  {creatingDemo ? (
                    <LoadingSpinner size="sm" className="text-green-800 mr-1" />
                  ) : (
                    <UserPlus className="h-3 w-3 mr-1" />
                  )}
                  Criar Usuário Demo
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Se o usuário demo não existir, clique em "Criar Usuário Demo" primeiro
            </p>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleTestConnection}
                className="w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors"
              >
                🔧 Testar Conexão com Supabase
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Use este botão para verificar se o Supabase está configurado corretamente
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}