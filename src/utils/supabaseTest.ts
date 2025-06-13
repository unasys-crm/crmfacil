// Utilitário para testar a conexão com Supabase
import { supabase } from '../lib/supabase'

// Função para verificar se a URL do Supabase está acessível
async function checkSupabaseUrl(url: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const response = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ Connection timeout - the request took too long')
      } else if (error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Network error - unable to reach Supabase')
      }
    }
    return false
  }
}

export async function testSupabaseConnection() {
  // Note: This function uses the default supabase client for testing
  // In a component, you would use useSupabase() hook instead
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Verificar se as variáveis de ambiente estão definidas
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    console.log('📋 Variáveis de ambiente:')
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? `✅ ${supabaseUrl}` : '❌ Não definida')
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Definida (oculta por segurança)' : '❌ Não definida')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      const missingVars = []
      if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
      if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')
      
      throw new Error(`Variáveis de ambiente não configuradas: ${missingVars.join(', ')}. Verifique o arquivo .env na raiz do projeto.`)
    }
    
    // Verificar se a URL do Supabase está acessível
    console.log('🌐 Testando conectividade com a URL do Supabase...')
    const isUrlAccessible = await checkSupabaseUrl(supabaseUrl)
    
    if (!isUrlAccessible) {
      console.warn(`⚠️ Não foi possível conectar com ${supabaseUrl}`)
      console.warn('💡 Possíveis causas:')
      console.warn('   • Projeto Supabase pausado ou inativo')
      console.warn('   • Firewall ou proxy bloqueando a conexão')
      console.warn('   • URL incorreta ou projeto deletado')
      console.warn('   • Problemas de conectividade de rede')
      console.warn('💡 Verifique o status do projeto em https://supabase.com')
      
      // Don't throw error, just warn - the app might still work for some operations
    } else {
      console.log('✅ URL do Supabase está acessível')
    }
    
    // Testar conexão básica com timeout
    console.log('🔐 Testando autenticação...')
    
    const authPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Authentication timeout')), 10000)
    })

    const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any
    
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message)
      return {
        success: false,
        error: error.message,
        details: 'Erro na autenticação. Verifique se a ANON_KEY está correta.'
      }
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    console.log('📊 Sessão atual:', data.session ? 'Usuário logado' : 'Nenhum usuário logado')
    
    // Testar acesso ao banco de dados com timeout
    console.log('🗄️ Testando acesso ao banco de dados...')
    try {
      const dbPromise = supabase
        .from('clients')
        .select('count')
        .limit(1)

      const dbTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database timeout')), 8000)
      })

      const { error: dbError } = await Promise.race([dbPromise, dbTimeoutPromise]) as any
      
      if (dbError) {
        console.warn('⚠️ Aviso: Não foi possível acessar a tabela clients:', dbError.message)
        console.log('💡 Isso é normal se as tabelas ainda não foram criadas')
        console.log('💡 Execute as migrações SQL no painel do Supabase para criar as tabelas')
      } else {
        console.log('✅ Acesso ao banco de dados funcionando')
      }
    } catch (dbError) {
      if (dbError instanceof Error && dbError.message === 'Database timeout') {
        console.warn('⚠️ Timeout no teste de banco de dados - a resposta está demorada')
      } else {
        console.warn('⚠️ Teste de banco de dados falhou:', dbError)
      }
    }
    
    return {
      success: true,
      session: data.session,
      url: supabaseUrl,
      hasSession: !!data.session
    }
    
  } catch (error) {
    console.error('❌ Erro crítico na conexão com Supabase:', error)
    
    // Fornecer dicas específicas baseadas no tipo de erro
    let helpMessage = ''
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        helpMessage = '\n💡 Dicas para resolver:\n' +
                     '1. Verifique sua conexão com a internet\n' +
                     '2. Confirme se a URL do Supabase está correta\n' +
                     '3. Verifique se não há bloqueios de firewall/proxy\n' +
                     '4. Tente acessar a URL diretamente no navegador\n' +
                     '5. Verifique se o projeto Supabase não está pausado'
      } else if (error.message.includes('Invalid API key')) {
        helpMessage = '\n💡 A chave da API (ANON_KEY) parece estar incorreta. Verifique no painel do Supabase.'
      } else if (error.message.includes('timeout')) {
        helpMessage = '\n💡 A conexão está demorando muito. Verifique sua conectividade de rede.'
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message + helpMessage : 'Erro desconhecido'
    }
  }
}

// Função para verificar o status das migrações
export async function checkMigrations() {
  try {
    console.log('🔍 Verificando status das migrações...')
    
    // Tentar acessar algumas tabelas principais
    const tables = ['clients', 'companies', 'deals', 'users', 'events']
    const results = []
    
    for (const table of tables) {
      try {
        const tablePromise = supabase
          .from(table)
          .select('count')
          .limit(1)

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Table check timeout')), 5000)
        })

        const { error: dbError } = await Promise.race([tablePromise, timeoutPromise]) as any
        
        if (dbError) {
          if (dbError.message.includes('relation') && dbError.message.includes('does not exist')) {
            results.push({ table, status: 'missing', message: 'Tabela não existe - execute as migrações' })
          } else {
            results.push({ table, status: 'error', message: dbError.message })
          }
        } else {
          results.push({ table, status: 'ok', message: 'Tabela acessível' })
        }
      } catch (err) {
        if (err instanceof Error && err.message === 'Table check timeout') {
          results.push({ table, status: 'timeout', message: 'Timeout ao verificar tabela' })
        } else {
          results.push({ table, status: 'error', message: 'Tabela não encontrada' })
        }
      }
    }
    
    console.log('📊 Status das tabelas:')
    results.forEach(result => {
      const icon = result.status === 'ok' ? '✅' : 
                   result.status === 'missing' ? '⚠️' : 
                   result.status === 'timeout' ? '⏱️' : '❌'
      console.log(`${icon} ${result.table}: ${result.message}`)
    })
    
    const missingTables = results.filter(r => r.status === 'missing')
    if (missingTables.length > 0) {
      console.log('\n💡 Para criar as tabelas em falta:')
      console.log('1. Acesse o painel do Supabase (https://supabase.com)')
      console.log('2. Vá para SQL Editor')
      console.log('3. Execute os arquivos SQL da pasta supabase/migrations/')
    }
    
    return results
    
  } catch (error) {
    console.error('❌ Erro ao verificar migrações:', error)
    return []
  }
}