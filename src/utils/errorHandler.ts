// Enhanced error handling utilities
export interface ErrorInfo {
  type: 'network' | 'auth' | 'database' | 'validation' | 'unknown'
  message: string
  userMessage: string
  suggestions: string[]
  canRetry: boolean
}

export function analyzeError(error: any): ErrorInfo {
  const errorMessage = error?.message || error?.toString() || 'Unknown error'
  
  // Network/Connectivity errors
  if (errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('fetch')) {
    return {
      type: 'network',
      message: errorMessage,
      userMessage: 'Não foi possível conectar com o servidor',
      suggestions: [
        'Verifique sua conexão com a internet',
        'Confirme se o projeto Supabase está ativo',
        'Teste a conexão na página de login',
        'Verifique se não há bloqueios de firewall'
      ],
      canRetry: true
    }
  }
  
  // Authentication errors
  if (errorMessage.includes('Invalid login credentials') ||
      errorMessage.includes('Email not confirmed') ||
      errorMessage.includes('Invalid API key')) {
    return {
      type: 'auth',
      message: errorMessage,
      userMessage: 'Erro de autenticação',
      suggestions: [
        'Verifique suas credenciais',
        'Confirme se o email foi verificado',
        'Verifique as configurações do Supabase'
      ],
      canRetry: true
    }
  }
  
  // Database errors
  if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
    return {
      type: 'database',
      message: errorMessage,
      userMessage: 'Tabela do banco de dados não encontrada',
      suggestions: [
        'Execute as migrações SQL no painel do Supabase',
        'Verifique se o banco de dados foi configurado corretamente'
      ],
      canRetry: false
    }
  }
  
  // Validation errors
  if (errorMessage.includes('violates') || 
      errorMessage.includes('constraint') ||
      errorMessage.includes('invalid input')) {
    return {
      type: 'validation',
      message: errorMessage,
      userMessage: 'Dados inválidos',
      suggestions: [
        'Verifique se todos os campos obrigatórios foram preenchidos',
        'Confirme se os dados estão no formato correto'
      ],
      canRetry: true
    }
  }
  
  // Default unknown error
  return {
    type: 'unknown',
    message: errorMessage,
    userMessage: 'Ocorreu um erro inesperado',
    suggestions: [
      'Tente novamente em alguns instantes',
      'Recarregue a página',
      'Entre em contato com o suporte se o problema persistir'
    ],
    canRetry: true
  }
}

export function showErrorNotification(error: any) {
  const errorInfo = analyzeError(error)
  
  console.group(`❌ ${errorInfo.type.toUpperCase()} ERROR`)
  console.error('Original error:', error)
  console.log('User message:', errorInfo.userMessage)
  console.log('Suggestions:')
  errorInfo.suggestions.forEach((suggestion, index) => {
    console.log(`  ${index + 1}. ${suggestion}`)
  })
  console.groupEnd()
  
  return errorInfo
}