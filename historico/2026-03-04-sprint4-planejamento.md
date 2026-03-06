# Planejamento Sprint 4 — Segurança
> Criado em: 04/03/2026 | Implementar na próxima sessão

---

## 🎯 Objetivo do Sprint 4

Blindar o app contra os principais vetores de ataque relevantes para um SaaS financeiro com dados fiscais de usuários.

---

## 🔴 Prioridade Alta (implementar primeiro)

### 1. Security Headers — `next.config.ts`
- Zero dependências, só configuração
- Adicionar `headers()` com:
  - `Content-Security-Policy` (CSP) — bloqueia scripts externos não autorizados
  - `X-Frame-Options: DENY` — previne clickjacking
  - `X-Content-Type-Options: nosniff` — previne MIME sniffing
  - `Strict-Transport-Security` — força HTTPS com max-age
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — desabilita câmera, microfone, geolocalização
- **Estimativa: ~15 min**

### 2. Correção de IDOR nas Rotas de API
- Bug atual: DELETE `/api/operacoes` filtra só por `id`, não por `userId`
  - Qualquer usuário autenticado pode deletar operação de outro se souber o UUID
- Fix: always add `AND userId = session.user.id` no where clause do Prisma
- Verificar também GET (não vazar dados de outros usuários)
- **Estimativa: ~15 min | CRÍTICO**

### 3. Validação de Inputs com Zod
- Instalar: `npm install zod` (provavelmente já instalado)
- Schemas para cada rota:
  - `/api/operacoes` POST: `tipo` (enum COMPRA|VENDA), `moeda` (string, max 20), `quantidade` (positive number), `valorTotal` (positive), `data` (YYYY-MM-DD), `exchange` (string, max 50)
  - `/api/ptax` GET: `data` regex `^\d{4}-\d{2}-\d{2}$`, `datas` array de datas
- Retornar 400 com mensagem amigável se inválido
- **Estimativa: ~1h**

### 4. Rate Limiting no Login
- Previne brute force de senhas
- Máx 10 tentativas por IP a cada 15 minutos
- Opção A (sem infra extra): Map em memória + timestamp (funciona em single instance)
- Opção B (robusta para Vercel edge): `@upstash/ratelimit` + Upstash Redis (free tier disponível)
- Implementar no handler do NextAuth credentials provider
- **Estimativa: ~30 min (Opção A) | ~1h (Opção B)**

---

## 🟡 Prioridade Média

### 5. Rate Limiting nas APIs de Dados
- `/api/operacoes` POST: máx 200 req/hora por userId
- `/api/ptax`: máx 100 req/hora por IP
- Retornar 429 com header `Retry-After`
- **Estimativa: ~30 min**

### 6. Sanitização de Inputs
- Strip HTML de strings antes de salvar no banco
- Biblioteca: `DOMPurify` (client) ou regex simples no server
- Validar whitelist de tipo de operação (além do Zod)
- Limite de tamanho já coberto pelo Zod
- **Estimativa: ~20 min**

### 7. Session Security
- Configurar `maxAge` explícito no NextAuth: 7 dias (604800 segundos)
- Absolute timeout: usuário precisa fazer login de novo após 7 dias mesmo com uso contínuo
- Configurar `updateAge: 86400` (atualiza o token 1x/dia)
- **Estimativa: ~15 min**

### 8. Audit Log
- Nova tabela Prisma `AuditLog`:
  ```prisma
  model AuditLog {
    id        String   @id @default(cuid())
    userId    String?
    action    String   // "LOGIN" | "REGISTER" | "DELETE_OPERACAO" | "EXPORT_RELATORIO"
    ip        String?
    userAgent String?
    metadata  Json?    // dados extras relevantes
    createdAt DateTime @default(now())
  }
  ```
- Logar: login (success/fail), registro, delete de operação, export de relatório
- Função helper `audit(action, req, userId?, metadata?)`
- **Estimativa: ~1h (schema + helper + integração)**

---

## 🟢 Prioridade Baixa

### 9. 2FA TOTP
- `npm install otplib qrcode`
- Adicionar campo `twoFactorSecret String?` no modelo `User`
- Página `/perfil` com:
  - QR code para escanear no Google Authenticator / Authy
  - Campo de confirmação com código de 6 dígitos
  - Enable / Disable com confirmação de senha
- Fluxo de login: se 2FA ativo → pedir código após senha
- **Estimativa: ~3-4h (UX complexa)**

---

## 📋 Ordem de implementação no dia

```
1. Security headers            (~15 min)
2. Fix IDOR nas APIs           (~15 min)
3. Zod em todas as rotas       (~1h)
4. Rate limiting login         (~30 min)
5. Rate limiting APIs          (~30 min)
6. Sanitização                 (~20 min)
7. Session maxAge              (~15 min)
8. Audit log                   (~1h)
9. 2FA (se sobrar tempo)       (~4h)
```

**Total estimado (sem 2FA): ~4h**

---

## 🔧 Dependências a instalar

```bash
npm install zod                          # validação (provavelmente já tem)
npm install @upstash/ratelimit ioredis   # rate limiting robusto (opcional)
npm install otplib qrcode                # 2FA (só se for implementar)
```

---

## 📁 Arquivos que serão modificados

- `next.config.ts` — security headers
- `src/app/api/operacoes/route.ts` — Zod, rate limit, fix IDOR
- `src/app/api/ptax/route.ts` — Zod, rate limit
- `src/app/api/auth/[...nextauth]/route.ts` ou `src/auth.ts` — rate limit login, session config
- `prisma/schema.prisma` — novo model AuditLog
- `src/lib/audit.ts` — helper de audit log (arquivo novo)
- `src/lib/rate-limit.ts` — helper de rate limiting (arquivo novo)
- `src/app/perfil/page.tsx` — configurações de conta (inclui 2FA se implementar)

---

## ✅ Critério de conclusão do Sprint 4

- [ ] Headers de segurança verificados via https://securityheaders.com
- [ ] IDOR testado: usuário A não consegue deletar operação do usuário B
- [ ] Zod: payload inválido retorna 400 (não 500)
- [ ] Login: após 10 tentativas erradas → 429 por 15 min
- [ ] Audit log: operações críticas aparecem na tabela
- [ ] Build limpo, 0 erros
- [ ] Deploy Vercel ✅
