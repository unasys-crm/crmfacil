# crmfacil

## ⚠️ Problemas de Conexão?

Se você está vendo erros como "Failed to fetch" ou problemas de conectividade:

### 1. Verificar Configuração
```bash
# Verifique se o arquivo .env existe na raiz do projeto
ls -la .env

# Conteúdo esperado:
VITE_SUPABASE_URL=https://owvnrfppxblaeuldmhdi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Testar Conectividade
- Use o botão "🔧 Testar Conexão com Supabase" na tela de login
- Abra o console do navegador (F12) para ver logs detalhados
- Verifique se consegue acessar https://owvnrfppxblaeuldmhdi.supabase.co diretamente

### 3. Problemas Comuns
- **Firewall/Proxy**: Alguns firewalls corporativos bloqueiam Supabase
- **URL incorreta**: Verifique se a URL não tem espaços ou caracteres extras
- **Chave inválida**: Confirme a ANON_KEY no painel do Supabase
- **Projeto pausado**: Projetos Supabase gratuitos podem ser pausados por inatividade

## Configuração do Supabase

Para que o sistema funcione corretamente, você precisa configurar as variáveis de ambiente do Supabase:

### 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://owvnrfppxblaeuldmhdi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dm5yZnBweGJsYWV1bGRtaGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzIwNzAsImV4cCI6MjA2NTMwODA3MH0.ZRlWwDTAbKI2HOVrgHyPGrpPFbECrrDze1ciWeDKy_o
```

### 2. Obter as credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Crie um novo projeto
4. Vá em Settings > API
5. Copie a URL e a chave anônima (anon key)

### 3. Configurar autenticação

No painel do Supabase:
1. Vá em Authentication > Settings
2. Desabilite "Enable email confirmations" para facilitar os testes
3. Configure as URLs de redirecionamento se necessário

### 4. Executar migrações

As migrações SQL estão na pasta `supabase/migrations/`. Execute-as no SQL Editor do Supabase ou use a CLI do Supabase.

### 5. Testar a conexão

- Na tela de login, use o botão "🔧 Testar Conexão com Supabase"
- No dashboard, abra o console do navegador para ver os logs de conectividade
- Use as credenciais demo: admin@crmfacil.com / 123456

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
