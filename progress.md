# Meu Imposto Cripto - Progresso

## Última atualização: 05/03/2026 — Sprint 5 concluído ✅ (Nota 10)

## 📌 Visão Geral

- **Objetivo:** Calculadora de IR para criptomoedas no Brasil (regras Receita Federal)
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Prisma, Neon PostgreSQL, NextAuth v5
- **Status:** 4 sprints completos — PTAX, autenticação, relatório IRPF, deploy, segurança
- **URL:** https://workspace-tau-olive.vercel.app
- **Commit atual:** Sprint 4 (segurança)

## ✅ Concluído

### Infraestrutura
- [x] Projeto Next.js 15 configurado
- [x] TypeScript + ESLint
- [x] Tailwind CSS + shadcn/ui
- [x] Deploy na Vercel funcionando
- [x] Git + GitHub configurado
- [x] Prisma v5 + Neon PostgreSQL (pooler sa-east-1)
- [x] NextAuth v5 beta (Credentials provider, JWT)
- [x] 19 rotas em produção (17 páginas + 2 API)
- [x] Zod instalado e schemas definidos
- [x] Rate limiting in-memory (`src/lib/rate-limit.ts`)
- [x] Security headers (CSP, HSTS, X-Frame-Options, etc.) em `next.config.ts`
- [x] Middleware edge-safe — proteção de rotas frontend (`src/middleware.ts`)
- [x] Auth split: `auth.config.ts` (edge-safe) + `auth.ts` (Node.js)

### Frontend
- [x] Landing page (hero, features, how-it-works)
- [x] Header responsivo com menu mobile
- [x] Header com estado de auth (dropdown, links condicionais)
- [x] Footer com links
- [x] Dark mode com toggle
- [x] Tema verde (#16a34a) consistente

### Calculadora
- [x] Formulário de operação manual
- [x] Upload e parse de CSV (Binance, MB, Bybit, Coinbase, Kraken, OKX)
- [x] Detecção automática de exchanges internacionais (USDT/USD)
- [x] Conversão PTAX automática antes de importar
- [x] Lista de operações com delete
- [x] Persistência: DB para logados, localStorage para guests (limite 50)
- [x] Cálculo de preço médio
- [x] Cálculo de ganho de capital
- [x] Cálculo de imposto devido
- [x] Resumo mensal com barra de progresso
- [x] Alerta de isenção/tributação
- [x] Portfolio com preço médio por cripto
- [x] Gráficos de evolução (barras e linhas)
- [x] Exportação para PDF

### Autenticação (Sprint 1)
- [x] Login com email/senha (bcrypt)
- [x] Register com validação
- [x] JWT session (NextAuth v5)
- [x] Rotas protegidas
- [x] Menu de usuário com dropdown

### PTAX — Banco Central (Sprint 3)
- [x] Proxy server-side `/api/ptax` → API oficial BCB
- [x] GET `?data=YYYY-MM-DD` (single) + `?datas=...` (bulk, Promise.all)
- [x] Cache em memória 12h (Map<string, {valor, timestamp}>)
- [x] Retry automático: recua até 7 dias (fins de semana / feriados)
- [x] Quirk descoberto: endpoint `CotacaoDolarDia` não tem `tipoBoletim` — removido
- [x] Formato de data correto: MM-DD-YYYY (exigido pela API BCB)
- [x] Painel âmbar na calculadora com preview das cotações antes de confirmar

### Relatório IRPF (Sprint 3)
- [x] `src/lib/relatorio.ts` — funções de geração:
  - `gerarRelatorioAnual(operacoes, ano)` — relatório completo
  - `gerarCSVOperacoes(operacoes)` — CSV BOM UTF-8, ponto-e-vírgula
  - `gerarTextoGCAP(relatorio)` — texto para preenchimento no GCAP
  - `extrairAnosComOperacoes(operacoes)` — seleção de ano
- [x] Página `/relatorio` autenticada:
  - Seção 1: Bens e Direitos — Grupo 08 (BTC→01, ETH→02, USDT/USDC→03, outros→09)
  - Seção 2: Ganho de Capital mês a mês (DARF / Isento / Sem vendas)
  - Seção 3: Rendimentos Isentos (código 05 IRPF)
  - Seção 4: Dados GCAP colapsável (copiar + exportar CSV)
  - Impressão otimizada (CSS print-friendly)

### Páginas de Conteúdo
- [x] FAQ com 16 perguntas em 4 categorias
- [x] Exemplos de cálculo (4 cenários)
- [x] Página de preços (3 planos)
- [x] Legislação (lei brasileira, DeCripto, FAQ)
- [x] Relatório IRPF (/relatorio)

### SEO & Marketing
- [x] Meta tags completas
- [x] Open Graph images
- [x] Twitter Cards
- [x] JSON-LD structured data
- [x] sitemap.xml dinâmico (com /relatorio)
- [x] robots.txt
- [x] llms.txt
- [x] Favicon e Apple Icon
- [x] manifest.json (PWA ready)
- [x] Analytics (Plausible + GA)

### Segurança (Sprint 4)
- [x] `src/lib/rate-limit.ts` — sliding window in-memory
  - `/api/ptax`: 30 req/min por IP
  - `/api/operacoes POST`: 100 req/min por usuário
  - `/api/operacoes DELETE`: 60 req/min por usuário
  - `/api/auth/register`: 5 req/15min por IP (anti-spam)
- [x] `src/lib/schemas.ts` — Zod schemas para todos os endpoints
  - `operacaoSchema` — tipo, cripto (regex A-Z0-9), números positivos, data, exchange
  - `operacoesBulkSchema` — array de até 500 operações
  - `registerSchema` — email, senha min 8 chars + número/símbolo, nome sanitizado
  - `ptaxSingleSchema` / `ptaxBulkSchema` — max 100 datas, max 500 chars
- [x] Sanitização de inputs — strip HTML e chars de controle
- [x] `next.config.ts` — security headers completos:
  - `Content-Security-Policy` (CSP)
  - `Strict-Transport-Security` (HSTS 2 anos)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
  - `X-DNS-Prefetch-Control: off`
- [x] `src/middleware.ts` — proteção de rotas frontend
  - Redireciona /calculadora, /relatorio, /perfil para /login se não autenticado
  - Preserva `callbackUrl` no redirect
- [x] Auth split edge-safe:
  - `auth.config.ts` — config sem bcryptjs (Edge Runtime)
  - `auth.ts` — estende config + Credentials provider + bcrypt (Node.js)
  - Middleware bundle: 112 kB → 87.1 kB
- [x] `src/lib/csrf.ts` — CSRF hardening:
  - Verifica header `Origin` vs `Host` em todas as mutations (POST, DELETE)
  - Dev: permite localhost | Prod: bloqueia origens externas com 403
- [x] Session Security em `auth.config.ts`:
  - `maxAge: 7 dias` — timeout absoluto da sessão
  - `updateAge: 24h` — renova cookie a cada dia de uso ativo
  - `issuedAt` no JWT — detecta tokens mais antigos que 7 dias e invalida
- [x] Audit Log (`src/lib/audit.ts` + tabela `AuditLog` no Neon):
  - Registra: `login`, `login_failed`, `register`, `operacao_delete`
  - Campos: `userId`, `action`, `ip`, `metadata` (JSON), `createdAt`
  - Falha silenciosa — nunca bloqueia o fluxo principal

### Sprint 5 — Nota 10 (05/03/2026)
- [x] Performance: `calcularResumosMensais` O(n²) → O(n log n) — portfolio incremental
- [x] UX: substituído `confirm()` e `alert()` por Dialog shadcn + Sonner toasts
- [x] UX: validação inline no formulário de operação (sem submit frustrado)
- [x] UX: busca/filtro na lista de operações
- [x] UX: bulk delete (`DELETE /api/operacoes?all=true`) com confirmação
- [x] CSV: `parseBinanceTransactionHistory` agora lança erro com instrução clara
- [x] Testes: 19 testes unitários Jest cobrindo `calculadora.ts` (portfolio, imposto, resumos mensais, geral)
- [x] "Esqueci a senha": fluxo completo de reset via e-mail (Resend)
  - `POST /api/auth/forgot-password` — gera token 256-bit, envia e-mail
  - `POST /api/auth/reset-password` — valida token, atualiza senha
  - `/esqueci-senha` e `/redefinir-senha` — páginas de UI
  - `PasswordResetToken` model no Neon
  - Rate limit: 3 tentativas/15min por IP (anti-enumeração)
- [x] Todas páginas no login agora têm link "Esqueci minha senha"

## 🚧 Em progresso

*Sprint 5 concluído — somente Stripe (pagamentos) pendente*

## ⚠️ Problemas conhecidos / Bugs

1. **PTAX BCB quirk** — endpoint `CotacaoDolarDia` não aceita `$filter=tipoBoletim` → resolvido removendo o filtro
2. **Neon pooler** — usar sempre `?pgbouncer=true&connect_timeout=30` na DATABASE_URL

## 📈 Métricas (04/03/2026)

- **Rotas:** 19 (17 páginas + /api/operacoes + /api/ptax)
- **Componentes:** 20+
- **Commits:** 10+
- **Build:** ✅ SUCCESS — 0 erros, 0 warnings críticos
- **Deploy:** ✅ workspace-tau-olive.vercel.app

## 📋 Sprint 4 — SEGURANÇA (próximo)

### 1. Rate Limiting (prioridade alta)
- Middleware em `/api/operacoes`, `/api/ptax`, `/api/auth`
- Máximo X requisições por IP por janela de tempo
- Biblioteca: `@upstash/ratelimit` + Upstash Redis OU solução in-memory simples

### 2. Validação de Inputs com Zod (prioridade alta)
- Zod schemas para TODOS os endpoints da API
- Validar tipos, ranges, enums (tipo de operação, moeda, valor)
- Retornar erros 400 detalhados mas sem vazar internals

### 3. Security Headers (prioridade alta)
- `next.config.ts` → `headers()` com:
  - `Content-Security-Policy` (CSP)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
  - `Strict-Transport-Security` (HSTS)

### 4. Proteção de Rotas de API (prioridade alta)
- Verificar session em TODAS as rotas protegidas (não só front)
- Verificar que operação pertence ao usuário antes de delete/update
- Nunca retornar dados de outro userId

### 5. CSRF Hardening (prioridade média)
- Double-submit cookie ou verificação de Origin header
- Garantir que Next.js CSRF protection está ativa

### 6. Session Security (prioridade média)
- Token rotation (a cada N horas)
- Absolute timeout (sessão expira mesmo com uso contínuo)
- Revogar sessão ao trocar senha

### 7. Audit Log (prioridade média)
- Logar operações sensíveis: login, registro, delete de operações, exports
- Tabela `audit_logs` no Neon (userId, action, ip, timestamp, metadata)

### 8. Sanitização de Inputs (prioridade média)
- Sanitizar strings antes de salvar no banco (strip HTML, etc.)
- Validar nome da moeda (whitelist ou regex)
- Limite de tamanho em campos de texto

### 9. 2FA (prioridade baixa — opcional)
- TOTP (Google Authenticator) via `otplib`
- Adicionar campo `twoFactorSecret` no User model
- Fluxo de enable/disable na página de perfil

## 🔧 Configurações importantes

### Variáveis de ambiente
```env
# Banco de dados (Neon — pooler)
DATABASE_URL="postgresql://...pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=30"

# Auth
AUTH_SECRET="..."
AUTH_URL="https://workspace-tau-olive.vercel.app"

# Analytics (opcional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=workspace-tau-olive.vercel.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Scripts úteis
```bash
npm run dev     # Desenvolvimento
npm run build   # Build produção (verificar 0 erros)
npm run start   # Rodar produção local
npm run lint    # Linting
```

### Testar PTAX manualmente
```bash
# Single
curl "https://workspace-tau-olive.vercel.app/api/ptax?data=2024-01-15"

# Bulk
curl "https://workspace-tau-olive.vercel.app/api/ptax?datas=2024-01-15,2024-06-01"

# Inválido (deve retornar 400)
curl "https://workspace-tau-olive.vercel.app/api/ptax?data=abc"
```

## 📚 Dependências principais

```json
{
  "next": "^15.1.0",
  "react": "^19.0.0",
  "next-auth": "^5.0.0-beta",
  "@prisma/client": "^5.x",
  "prisma": "^5.x",
  "bcryptjs": "^2.4.3",
  "recharts": "^2.15.0",
  "tailwindcss": "^3.4.17",
  "@radix-ui/*": "latest",
  "lucide-react": "^0.469.0",
  "zod": "^3.x"
}
```
