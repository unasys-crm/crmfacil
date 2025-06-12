# crmfacil

## Configuração do Supabase

Para que o sistema funcione corretamente, você precisa configurar as variáveis de ambiente do Supabase:

### 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
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