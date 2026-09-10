# NEXO — Hub Digital Pessoal & Familiar

> **"A tua vida, num só lugar. Tudo o que precisas. Num só lugar."**

O **NEXO** é uma plataforma digital pessoal e familiar unificada, desenhada com uma abordagem *mobile-first*, resiliente a falhas de rede (PWA com suporte offline e sincronização) e integrada com Inteligência Artificial avançada em linguagem natural via Groq.

---

## 🌟 Principais Funcionalidades

- **Tarefas**: Gestão de tarefas diárias, próximas, atrasadas e concluídas com filtros e ordenação por prioridade/data.
- **Agenda / Calendário**: Eventos e compromissos com suporte a horários e notas.
- **Listas & Notas**: Listas personalizadas e de compras com itens interativos.
- **Metas & Objectivos**: Acompanhamento de metas de vida com barras de progresso dinâmicas.
- **Aprender MVP**: Objectivos de aprendizagem, módulos e planos de estudo com acompanhamento de percentual.
- **Família & Permissões**: Criação de grupos familiares, entrada via código de convite único (`invite_code`) e controlo de papéis (`owner`, `admin`, `member`) no PostgreSQL.
- **PWA & Capacidades Offline**: Funcionamento offline com suporte IndexedDB local scoped por utilizador e sincronização sequencial com reconciliação de concorrência por timestamp (`updated_at`).
- **Realtime do Supabase**: Atualizações ao vivo para recursos partilhados familiares.
- **NEXO Text AI**: Assistente pessoal em linguagem natural alimentado pelo modelo `openai/gpt-oss-120b` com *Tool Calling* seguro no backend e observabilidade via `ai_actions_log`.
- **Acessibilidade & Design System**: Conformidade com **WCAG 2.2 AA** (navegação por teclado, focus rings, leitores de ecrã, Simple Mode e Dark Mode).

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4.
- **Estado & Cache**: TanStack React Query v5.
- **Backend & Autenticação**: Supabase (PostgreSQL 15, Auth com OAuth/Email/Telefone/Convidado, Row Level Security).
- **Offline Storage**: IndexedDB (Native Browser IDB Engine com isolamento de sessão).
- **IA & Inferencia**: Groq API via Supabase Edge Function (`supabase/functions/nexo-ai`).
- **Ícones & UI**: Lucide Icons, Design System unificado em `src/components/ui/`.

---

## 🚀 Instalação e Configuração

### 1. Clonar o Repositório e Instalar Dependências

```bash
cd NEXO
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie o ficheiro `.env` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env
```

Preencha as suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Configurar a Chave do Groq no Servidor / Edge Function

> ⚠️ **REGRA CRÍTICA DE SEGURANÇA**: A `GROQ_API_KEY` **NUNCA** deve ter o prefixo `VITE_` nem ser exposta no código React.

Para o ambiente da Supabase Edge Function, configure o secret:

```bash
supabase secrets set GROQ_API_KEY=gsk_your_groq_api_key_here
```

---

## 📄 Estrutura da Base de Dados & Migrações SQL

Aplique a migração contida em `supabase/migrations/20260905000000_initial_schema.sql` no SQL Editor do seu projeto Supabase para criar:
- Tabelas: `profiles`, `family_groups`, `family_members`, `tasks`, `events`, `lists`, `list_items`, `goals`, `learning_objectives`, `learning_plans`, `learning_items`, `ai_conversations`, `ai_actions_log`.
- Funções plpgsql de verificação de permissão: `public.is_family_member()`.
- Políticas RLS para todas as tabelas.

---

## 🏃 Executando a Aplicação em Desenvolvimento

```bash
npm run dev
```

Abra o browser em `http://localhost:5173`.

---

## 🧪 Verificação Automatizada e Testes de Auditoria

O projeto conta com scripts de auditoria automatizada para validar cada fase de desenvolvimento:

```bash
# Validar RLS, Isolamento e Módulos da Fase 5
node scripts/verify_phase5.js

# Validar PWA, IndexedDB e Sync Engine da Fase 6
node scripts/verify_phase6.js

# Validar Segurança da IA, Edge Function e 25 Tools da Fase 7
node scripts/verify_phase7.js

# Executar Auditoria Final da Fase 8
node scripts/verify_phase8.js
```

---

## 📦 Build para Produção

```bash
npm run build
```

O comando executa a verificação estrita de tipos do TypeScript (`tsc`) e compila o bundle de produção otimizado com Vite em `dist/`.

---

## 🔒 Considerações de Segurança

- **Row Level Security (RLS)** ativa em 100% das tabelas do PostgreSQL.
- **Zero Secrets no Frontend**: Nenhuma chave privada ou service role exposta no bundle.
- **Isolamento de Dados no Logout**: O `signOut` limpa totalmente a cache do IndexedDB e do React Query.
- **Prompt Injection**: Payloads de IA segregados; textos de tarefas/listas tratados estritamente como dados passivos.

---

## 📜 Licença

Propriedade do Projeto NEXO. Todos os direitos reservados.
