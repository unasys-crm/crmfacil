// Utilitário para testar a conexão com Supabase
import { supabase } from '../lib/supabase'

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Verificar se as variáveis de ambiente estão definidas
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    console.log('📋 Variáveis de ambiente:')
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida')
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variáveis de ambiente do Supabase não estão configuradas')
    }
    
    // Testar conexão básica
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message)
      return {
        success: false,
        error: error.message,
        details: 'Erro na autenticação'
      }
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    console.log('📊 Sessão atual:', data.session ? 'Usuário logado' : 'Nenhum usuário logado')
    
    // Testar acesso ao banco de dados
    try {
      const { error: dbError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (dbError) {
        console.warn('⚠️ Aviso: Não foi possível acessar a tabela users:', dbError.message)
        console.log('💡 Isso é normal se as tabelas ainda não foram criadas')
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// Função para verificar o status das migrações
export async function checkMigrations() {
  try {
    console.log('🔍 Verificando status das migrações...')
    
    // Tentar acessar algumas tabelas principais
    const tables = ['users', 'companies', 'clients', 'deals']
    const results = []
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          results.push({ table, status: 'error', message: error.message })
        } else {
          results.push({ table, status: 'ok', message: 'Tabela acessível' })
        }
      } catch (err) {
        results.push({ table, status: 'error', message: 'Tabela não encontrada' })
      }
    }
    
    console.log('📊 Status das tabelas:')
    results.forEach(result => {
      const icon = result.status === 'ok' ? '✅' : '❌'
      console.log(`${icon} ${result.table}: ${result.message}`)
    })
    
    return results
    
  } catch (error) {
    console.error('❌ Erro ao verificar migrações:', error)
    return []
  }
}