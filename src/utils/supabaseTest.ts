// Utilitário para testar a conexão com Supabase
import { supabase } from '../lib/supabase'
import { useSupabase } from '../hooks/useSupabase'

// Função para verificar se a URL do Supabase está acessível
async function checkSupabaseUrl(url: string) {
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
      }
    })
    return response.ok
  } catch (error) {
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
      throw new Error(`Não foi possível conectar com ${supabaseUrl}. Verifique se a URL está correta e se você tem acesso à internet.`)
    }
    
    console.log('✅ URL do Supabase está acessível')
    
    // Testar conexão básica
    console.log('🔐 Testando autenticação...')
    const { data, error } = await supabase.auth.getSession()
    
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
    
    // Testar acesso ao banco de dados
    console.log('🗄️ Testando acesso ao banco de dados...')
    try {
      const { error: dbError } = await supabase
        .from('clients')
        .select('count')
        .limit(1)
      
      if (dbError) {
        console.warn('⚠️ Aviso: Não foi possível acessar a tabela clients:', dbError.message)
        console.log('💡 Isso é normal se as tabelas ainda não foram criadas')
        console.log('💡 Execute as migrações SQL no painel do Supabase para criar as tabelas')
      } else {
        console.log('✅ Acesso ao banco de dados funcionando')
      }
    } catch (dbError) {
      console.warn('⚠️ Teste de banco de dados falhou:', dbError)
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
                     '4. Tente acessar a URL diretamente no navegador'
      } else if (error.message.includes('Invalid API key')) {
        helpMessage = '\n💡 A chave da API (ANON_KEY) parece estar incorreta. Verifique no painel do Supabase.'
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
        const { error: dbError } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
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
        results.push({ table, status: 'error', message: 'Tabela não encontrada' })
      }
    }
    
    console.log('📊 Status das tabelas:')
    results.forEach(result => {
      const icon = result.status === 'ok' ? '✅' : result.status === 'missing' ? '⚠️' : '❌'
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